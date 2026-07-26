const { v4: uuidv4 } = require("uuid");
const { LANGUAGES } = require("./languages");
const { createWorkspace, writeSourceFiles, destroyWorkspace } = require("./workspace");
const { runInDocker } = require("./dockerRunner");
const { runLocally } = require("./localRunner");
const { parseDiagnostics } = require("./debugger");

const DOCKER_MODE = process.env.DOCKER_MODE === "true";

/**
 * Full pipeline: validate -> workspace -> source file -> compile -> execute ->
 * capture -> cleanup -> structured result. Mirrors the flow in the backend spec.
 */
async function executeCode({ language, code, stdin }) {
  const executionId = uuidv4().slice(0, 8);
  const config = LANGUAGES[language];
  const startedAt = Date.now();

  const workspaceDir = await createWorkspace(executionId);
  await writeSourceFiles(workspaceDir, { [config.fileName]: code });

  const result = {
    executionId,
    success: false,
    stdout: "",
    stderr: "",
    compileError: "",
    diagnostics: [],
    hint: null,
    runtimeMs: 0,
    compileMs: 0,
    memoryMb: null,
    exitCode: null,
    timedOut: false,
    inputRequired: false,
  };

  const exec = (command, timeoutMs) =>
    DOCKER_MODE
      ? runInDocker({ image: config.dockerImage, workspaceDir, command, stdin: "", timeoutMs, memoryMb: config.memoryMb })
      : runLocally({ workspaceDir, command, stdin: "", timeoutMs });

  try {
    // --- Step 5: Compile (if required) ---
    if (config.compile) {
      const compileStart = Date.now();
      const compileResult = await exec(config.compile, config.timeoutMs);
      result.compileMs = Date.now() - compileStart;

      if (compileResult.exitCode !== 0) {
        result.compileError = compileResult.stderr || "Compilation failed.";
        const { diagnostics, hint } = parseDiagnostics(language, result.compileError);
        result.diagnostics = diagnostics;
        result.hint = hint;
        result.exitCode = compileResult.exitCode;
        await destroyWorkspace(workspaceDir);
        return result;
      }
    }

    // --- Step 6-8: Execute, pass stdin, capture everything ---
    const runExec = (command, timeoutMs) =>
      DOCKER_MODE
        ? runInDocker({ image: config.dockerImage, workspaceDir, command, stdin, timeoutMs, memoryMb: config.memoryMb })
        : runLocally({ workspaceDir, command, stdin, timeoutMs });

    const runResult = await runExec(config.run, config.timeoutMs);
    const inputRequired =
      !stdin.trim() &&
      language === "python" &&
      /EOFError: EOF when reading a line/.test(runResult.stderr);

    result.stdout = runResult.stdout;
    // An empty input stream is an expected user interaction, not a code error.
    // Hide Python's traceback and let the UI ask for stdin instead.
    result.stderr = inputRequired ? "" : runResult.stderr;
    result.exitCode = runResult.exitCode;
    result.timedOut = runResult.timedOut;
    result.inputRequired = inputRequired;
    result.runtimeMs = runResult.runtimeMs;
    result.success = runResult.exitCode === 0 && !runResult.timedOut;

    if (!result.success && !inputRequired) {
      const { diagnostics, hint } = parseDiagnostics(language, result.stderr);
      result.diagnostics = diagnostics;
      result.hint = hint;
    }
  } finally {
    // --- Step 12: Delete temp files, always, even on crash ---
    await destroyWorkspace(workspaceDir);
  }

  result.totalMs = Date.now() - startedAt;
  return result;
}

module.exports = { executeCode };
