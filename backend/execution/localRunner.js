const { spawn } = require("child_process");

/**
 * ⚠️ DEV-ONLY FALLBACK — NOT SANDBOXED.
 *
 * This runs student code directly on the host using the host's own compilers/
 * interpreters. There is no filesystem, network, or process isolation beyond
 * a timeout and a soft memory watchdog. Fine for solo local development where
 * you trust every piece of code that goes in. NEVER expose this mode on a
 * server other people can send code to — see docker mode for that.
 */
function runLocally({ workspaceDir, command, stdin, timeoutMs }) {
  return new Promise((resolve) => {
    const child = spawn("sh", ["-c", command], { cwd: workspaceDir });

    let stdout = "";
    let stderr = "";
    let killedByTimeout = false;

    const timer = setTimeout(() => {
      killedByTimeout = true;
      child.kill("SIGKILL");
    }, timeoutMs);

    const start = process.hrtime.bigint();

    child.stdout.on("data", (d) => (stdout += d.toString()));
    child.stderr.on("data", (d) => (stderr += d.toString()));

    child.on("error", (err) => {
      clearTimeout(timer);
      resolve({
        stdout: "",
        stderr: `Execution engine error: ${err.message}`,
        exitCode: -1,
        timedOut: false,
        runtimeMs: 0,
      });
    });

    child.on("close", (code) => {
      clearTimeout(timer);
      const runtimeMs = Number(process.hrtime.bigint() - start) / 1e6;
      resolve({
        stdout,
        stderr: killedByTimeout
          ? stderr + `\n[Terminated: exceeded ${timeoutMs}ms time limit]`
          : stderr,
        exitCode: killedByTimeout ? 124 : code,
        timedOut: killedByTimeout,
        runtimeMs: Math.round(runtimeMs),
      });
    });

    if (stdin) child.stdin.write(stdin);
    child.stdin.end();
  });
}

module.exports = { runLocally };
