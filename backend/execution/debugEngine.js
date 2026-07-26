/**
 * debugEngine.js — SkyCompiler Python Step Debugger Backend
 * ==========================================================
 * Orchestrates a full debug run of Python code by:
 *   1. Writing tracer.py + user_code.py into a temp workspace
 *   2. Running `python3 tracer.py` (or `python` on Windows) with stdin supplied
 *   3. Parsing the JSONL output into a typed steps array
 *   4. Returning the complete execution timeline
 *
 * Architecture is kept intentionally thin so that future tracers (Node.js,
 * GDB-based, DAP-based) can be added by implementing the same interface:
 *   debugCode({ language, code, stdin }) → { steps, totalSteps, error }
 */

const path = require("path");
const fs = require("fs/promises");
const { v4: uuidv4 } = require("uuid");
const { createWorkspace, destroyWorkspace } = require("./workspace");
const { runLocally } = require("./localRunner");

const TRACER_PATH = path.join(__dirname, "tracer.py");
const MAX_STEPS = 2000;
const DEBUG_TIMEOUT_MS = 15000; // 15 s — longer than run because tracing adds overhead

/**
 * Supported debug languages and how to invoke their tracer.
 * Future: add node, gdb, jdb entries here.
 */
const DEBUG_RUNNERS = {
  python: {
    command: process.platform === "win32" ? "python tracer.py" : "python3 tracer.py",
  },
};

/**
 * Parse a raw JSONL string emitted by tracer.py into a clean steps array.
 * Lines that fail JSON.parse are silently dropped (defensive).
 */
function parseSteps(rawOutput) {
  const lines = rawOutput.split("\n").filter((l) => l.trim().length > 0);
  const steps = [];

  for (const line of lines) {
    try {
      const step = JSON.parse(line);
      // Validate minimum shape
      if (typeof step.stepIndex === "number" && typeof step.line === "number") {
        steps.push(step);
      }
    } catch {
      // Non-JSON line — tracer printed something unexpected, skip it
    }
  }

  // Sort by stepIndex in case any lines arrived out of order
  steps.sort((a, b) => a.stepIndex - b.stepIndex);
  return steps;
}

/**
 * Main entry point. Mirrors the signature of executeCode() in engine.js
 * so the route handler can call both uniformly.
 */
async function debugCode({ language, code, stdin = "" }) {
  const runner = DEBUG_RUNNERS[language];
  if (!runner) {
    return {
      steps: [],
      totalSteps: 0,
      error: `Debug mode is not yet supported for ${language}. Currently supported: ${Object.keys(DEBUG_RUNNERS).join(", ")}.`,
    };
  }

  const executionId = uuidv4().slice(0, 8);
  const workspaceDir = await createWorkspace(`dbg-${executionId}`);

  try {
    // 1. Copy tracer.py into workspace
    const tracerSource = await fs.readFile(TRACER_PATH, "utf8");
    await fs.writeFile(path.join(workspaceDir, "tracer.py"), tracerSource, "utf8");

    // 2. Write user code as user_code.py
    await fs.writeFile(path.join(workspaceDir, "user_code.py"), code ?? "", "utf8");

    // 3. Execute tracer
    const result = await runLocally({
      workspaceDir,
      command: runner.command,
      stdin,
      timeoutMs: DEBUG_TIMEOUT_MS,
    });

    if (result.timedOut) {
      return {
        steps: [],
        totalSteps: 0,
        error: `Debug session timed out after ${DEBUG_TIMEOUT_MS / 1000}s. Your program may have an infinite loop. Add a step limit or check your loop conditions.`,
      };
    }

    // 4. Parse JSONL output
    const steps = parseSteps(result.stdout);

    if (steps.length === 0 && result.stderr) {
      // Syntax error or import error — tracer crashed before emitting any steps
      return {
        steps: [],
        totalSteps: 0,
        error: result.stderr.trim(),
      };
    }

    if (steps.length === 0) {
      return {
        steps: [],
        totalSteps: 0,
        error: "No executable statements found. Make sure your code has at least one statement.",
      };
    }

    return {
      steps: steps.slice(0, MAX_STEPS),
      totalSteps: Math.min(steps.length, MAX_STEPS),
      truncated: steps.length > MAX_STEPS,
      error: null,
    };
  } finally {
    await destroyWorkspace(workspaceDir);
  }
}

module.exports = { debugCode };
