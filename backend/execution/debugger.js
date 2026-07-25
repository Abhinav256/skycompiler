/**
 * Turns raw stderr text into structured diagnostics the frontend can pin to
 * exact editor lines (red squiggles, gutter markers, click-to-jump).
 * This is what "debugging support" means in a browser compiler — there's no
 * live breakpoint/step-through debugger here (that needs a language-specific
 * debug adapter per runtime — DAP for gdb/pdb/jdb — noted as a roadmap item
 * in the README). What you get instead: precise, clickable error locations,
 * a compile/runtime distinction, and a plain-English hint for common failures.
 */

const PATTERNS = {
  python: /File "main\.py", line (\d+).*?\n(?:.*\n)*?(\w+Error.*)/,
  c: /main\.c:(\d+):(\d+): (error|warning): (.*)/,
  cpp: /main\.cpp:(\d+):(\d+): (error|warning): (.*)/,
  java: /Main\.java:(\d+): (error|warning): (.*)/,
  javascript: /main\.js:(\d+)/,
};

const COMMON_HINTS = [
  { match: /IndentationError/i, hint: "Python is whitespace-sensitive — check that this block is indented consistently (spaces vs tabs)." },
  { match: /NameError: name '(\w+)' is not defined/i, hint: "This variable or function isn't defined before it's used — check spelling and order." },
  { match: /segmentation fault/i, hint: "Likely an out-of-bounds array access or a null/dangling pointer dereference." },
  { match: /ClassNotFoundException|Could not find or load main class/i, hint: "Your public class name must exactly match the file name Main.java (case-sensitive)." },
  { match: /ZeroDivisionError|division by zero/i, hint: "Division by zero — guard the denominator before dividing." },
  { match: /Cannot read propert(y|ies) of undefined/i, hint: "You're accessing a property on something that's undefined — check it was initialized." },
  { match: /expected ';' before/i, hint: "Missing semicolon — check the line just above the one reported." },
];

function parseDiagnostics(language, rawStderr) {
  if (!rawStderr) return { diagnostics: [], hint: null };

  const diagnostics = [];
  const pattern = PATTERNS[language];

  if (pattern) {
    // Scan line-by-line so multi-error compiler output (C/C++/Java) yields multiple markers.
    const lines = rawStderr.split("\n");
    for (const line of lines) {
      const m = line.match(pattern);
      if (m) {
        if (language === "c" || language === "cpp") {
          diagnostics.push({ line: Number(m[1]), column: Number(m[2]), severity: m[3], message: m[4] });
        } else if (language === "java") {
          diagnostics.push({ line: Number(m[1]), column: null, severity: m[2], message: m[3] });
        } else if (language === "python" || language === "javascript") {
          diagnostics.push({ line: Number(m[1]), column: null, severity: "error", message: rawStderr.trim().split("\n").pop() });
        }
      }
    }
  }

  const hintEntry = COMMON_HINTS.find((h) => h.match.test(rawStderr));

  return {
    diagnostics,
    hint: hintEntry ? hintEntry.hint : null,
  };
}

module.exports = { parseDiagnostics };
