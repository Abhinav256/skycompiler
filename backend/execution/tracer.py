"""
tracer.py — SkyCompiler Python Step Debugger
=============================================
Runs user code (from user_code.py in the same directory) and emits one
JSON-lines record per executable step to stdout.

Architecture note: This script is written to be self-contained so it can
be dropped into any workspace directory and run with a plain `python3 tracer.py`.
The backend (debugEngine.js) writes this file into the workspace alongside the
user's code and reads JSONL from stdout.

Each emitted record looks like:
{
  "stepIndex": 0,
  "line": 3,
  "event": "line",             // "line" | "call" | "return" | "exception"
  "functionName": "<module>",
  "variables": {
    "x": { "type": "int", "repr": "42", "value": 42 }
  },
  "stdout": "",                // cumulative stdout UP TO this step
  "exception": null            // { "type": "...", "message": "..." } | null
}

Design limits:
  - Max 2000 steps (avoids infinite-loop hangs)
  - Variable values serialized up to depth 4 (avoids giant nested objects)
  - Circular references replaced with "<circular>"
  - Unpicklable / unusual objects fall back to repr()
"""

import sys
import os
import io
import json
import types
import builtins

# ── Configuration ──────────────────────────────────────────────────────────────
MAX_STEPS = 2000
MAX_DEPTH = 4
MAX_COLLECTION_ITEMS = 64   # truncate large lists/dicts
MAX_STRING_LEN = 300        # truncate long strings

# ── Stdout capture ─────────────────────────────────────────────────────────────
_real_stdout = sys.stdout
_captured_stdout = io.StringIO()

class _TeeStream(io.TextIOBase):
    """Writes to the captured buffer; real stdout is suppressed during tracing."""
    def write(self, s):
        _captured_stdout.write(s)
        return len(s)
    def flush(self):
        _captured_stdout.flush()

sys.stdout = _TeeStream()

# ── Step storage ───────────────────────────────────────────────────────────────
_steps = []
_step_index = 0
_current_exception = None

# ── Variable serializer ────────────────────────────────────────────────────────
def _serialize(value, depth=0, seen=None):
    """Recursively serialize a Python value to a JSON-safe dict."""
    if seen is None:
        seen = set()

    obj_id = id(value)

    if depth > MAX_DEPTH:
        return {"type": type(value).__name__, "repr": repr(value)[:MAX_STRING_LEN], "truncated": True}

    # Primitives
    if value is None:
        return {"type": "NoneType", "repr": "None", "value": None}
    if isinstance(value, bool):
        return {"type": "bool", "repr": repr(value), "value": value}
    if isinstance(value, int):
        return {"type": "int", "repr": repr(value), "value": value}
    if isinstance(value, float):
        r = repr(value)
        return {"type": "float", "repr": r, "value": value}
    if isinstance(value, str):
        truncated = len(value) > MAX_STRING_LEN
        display = value[:MAX_STRING_LEN] + ("…" if truncated else "")
        return {"type": "str", "repr": repr(display), "value": display, "length": len(value)}

    # Circular reference guard
    if obj_id in seen:
        return {"type": type(value).__name__, "repr": "<circular>", "circular": True}
    seen = seen | {obj_id}

    if isinstance(value, (list, tuple)):
        type_name = "list" if isinstance(value, list) else "tuple"
        truncated = len(value) > MAX_COLLECTION_ITEMS
        items = [_serialize(v, depth + 1, seen) for v in list(value)[:MAX_COLLECTION_ITEMS]]
        return {"type": type_name, "repr": repr(value)[:MAX_STRING_LEN], "items": items,
                "length": len(value), "truncated": truncated}

    if isinstance(value, dict):
        truncated = len(value) > MAX_COLLECTION_ITEMS
        pairs = []
        for k, v in list(value.items())[:MAX_COLLECTION_ITEMS]:
            pairs.append({"key": _serialize(k, depth + 1, seen),
                          "value": _serialize(v, depth + 1, seen)})
        return {"type": "dict", "repr": repr(value)[:MAX_STRING_LEN], "pairs": pairs,
                "length": len(value), "truncated": truncated}

    if isinstance(value, (set, frozenset)):
        type_name = "frozenset" if isinstance(value, frozenset) else "set"
        truncated = len(value) > MAX_COLLECTION_ITEMS
        items = [_serialize(v, depth + 1, seen) for v in list(value)[:MAX_COLLECTION_ITEMS]]
        return {"type": type_name, "repr": repr(value)[:MAX_STRING_LEN], "items": items,
                "length": len(value), "truncated": truncated}

    # Custom class instances
    if hasattr(value, "__dict__") and not isinstance(value, type):
        attrs = {}
        for attr_name, attr_val in list(vars(value).items())[:MAX_COLLECTION_ITEMS]:
            if not attr_name.startswith("__"):
                try:
                    attrs[attr_name] = _serialize(attr_val, depth + 1, seen)
                except Exception:
                    attrs[attr_name] = {"type": "?", "repr": "?"}
        return {"type": type(value).__name__, "repr": repr(value)[:MAX_STRING_LEN],
                "attrs": attrs, "isObject": True}

    # Callables, modules, and everything else
    if callable(value):
        return {"type": "function", "repr": getattr(value, "__name__", repr(value))}

    try:
        return {"type": type(value).__name__, "repr": repr(value)[:MAX_STRING_LEN]}
    except Exception:
        return {"type": "?", "repr": "?"}


def _capture_variables(frame):
    """Extract local and global variables from a frame, excluding dunder/built-ins."""
    result = {}
    # Locals take priority; fall back to globals for module-level code
    all_vars = {**frame.f_globals, **frame.f_locals}

    for name, val in all_vars.items():
        # Skip private/magic names and modules
        if name.startswith("_"):
            continue
        if isinstance(val, types.ModuleType):
            continue
        if callable(val) and isinstance(val, types.FunctionType):
            continue
        # Skip our own injected names
        if name in ("__builtins__", "__doc__", "__file__", "__loader__",
                    "__name__", "__package__", "__spec__"):
            continue
        try:
            result[name] = _serialize(val)
        except Exception:
            result[name] = {"type": "?", "repr": "?"}

    return result


# ── Tracer ─────────────────────────────────────────────────────────────────────
def _trace_calls(frame, event, arg):
    """sys.settrace hook — fires for every event in every frame."""
    global _step_index, _current_exception

    # Only trace code from the user's file
    filename = frame.f_code.co_filename
    if not filename.endswith("user_code.py"):
        return _trace_calls  # must still return itself to trace child calls

    if _step_index >= MAX_STEPS:
        return None  # stop tracing

    # Exception tracking
    exc_info = None
    if event == "exception":
        exc_type, exc_value, _ = arg
        exc_info = {"type": exc_type.__name__, "message": str(exc_value)}
        _current_exception = exc_info
        # Don't emit a separate step for exception events — mark the next line step
        return _trace_calls
    elif event == "line":
        # If there was a pending exception, attach it to this line step then clear
        exc_snapshot = _current_exception
        _current_exception = None
    else:
        exc_snapshot = None

    if event in ("line", "call", "return"):
        if event == "call" and _step_index == 0 and frame.f_code.co_name == "<module>":
            return _trace_calls
        # Capture state
        cumulative_stdout = _captured_stdout.getvalue()
        variables = _capture_variables(frame)

        step = {
            "stepIndex": _step_index,
            "line": frame.f_lineno,
            "event": event,
            "functionName": frame.f_code.co_name,
            "variables": variables,
            "stdout": cumulative_stdout,
            "exception": exc_snapshot,
        }
        _steps.append(step)
        _step_index += 1

    return _trace_calls


# ── Main ───────────────────────────────────────────────────────────────────────
def _run():
    global _current_exception

    user_code_path = os.path.join(os.path.dirname(__file__), "user_code.py")
    with open(user_code_path, "r", encoding="utf-8") as f:
        source = f.read()

    code_obj = compile(source, "user_code.py", "exec")

    # Provide a clean global namespace that looks like __main__
    global_ns = {
        "__name__": "__main__",
        "__file__": "user_code.py",
        "__builtins__": builtins,
    }

    sys.settrace(_trace_calls)
    try:
        exec(code_obj, global_ns)
    except SystemExit:
        pass
    except Exception as exc:
        # Final unhandled exception — attach to last step or create an error step
        exc_info = {"type": type(exc).__name__, "message": str(exc)}
        if _steps:
            # Patch the last step with the exception
            _steps[-1]["exception"] = exc_info
        else:
            _steps.append({
                "stepIndex": 0,
                "line": 1,
                "event": "exception",
                "functionName": "<module>",
                "variables": {},
                "stdout": _captured_stdout.getvalue(),
                "exception": exc_info,
            })
    finally:
        sys.settrace(None)

    # Emit all steps as JSONL to the real stdout
    for step in _steps:
        _real_stdout.write(json.dumps(step) + "\n")
    _real_stdout.flush()


if __name__ == "__main__":
    _run()
