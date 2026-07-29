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
const MAX_OUTPUT_BYTES = 1024 * 1024; // Avoid an infinite print loop exhausting the server.

function runLocally({ workspaceDir, command, stdin, timeoutMs }) {
  return new Promise((resolve) => {
    // Local development supports both Unix-like systems and Windows. The
    // configured commands are shell commands, so use the host's native shell
    // instead of assuming `/bin/sh` exists (it does not on standard Windows).
    const isWindows = process.platform === "win32";
    const shell = isWindows ? process.env.ComSpec || "cmd.exe" : "sh";
    const args = isWindows ? ["/d", "/s", "/c", command] : ["-c", command];
    // A process group lets us terminate the compiler/interpreter as well as
    // the shell that launched it. This is essential for Java on Windows.
    const child = spawn(shell, args, {
      cwd: workspaceDir,
      detached: !isWindows,
      windowsHide: true,
    });

    let stdout = "";
    let stderr = "";
    let killedByTimeout = false;
    let killedForOutput = false;
    let settled = false;

    const terminateProcessTree = () => {
      if (child.exitCode !== null || child.killed) return;

      if (isWindows) {
        // child.kill only stops cmd.exe; taskkill /T also stops java.exe,
        // python.exe, and every other descendant started by the command.
        const killer = spawn("taskkill", ["/pid", String(child.pid), "/T", "/F"], { windowsHide: true });
        killer.on("error", () => child.kill("SIGKILL"));
      } else {
        try {
          process.kill(-child.pid, "SIGKILL");
        } catch {
          child.kill("SIGKILL");
        }
      }
    };

    const timer = setTimeout(() => {
      killedByTimeout = true;
      terminateProcessTree();
    }, timeoutMs);

    const start = process.hrtime.bigint();

    const collectOutput = (target, d) => {
      if (killedForOutput) return;
      const text = d.toString();
      if (Buffer.byteLength(stdout) + Buffer.byteLength(stderr) + Buffer.byteLength(text) > MAX_OUTPUT_BYTES) {
        killedForOutput = true;
        terminateProcessTree();
        return;
      }
      if (target === "stdout") stdout += text;
      else stderr += text;
    };

    child.stdout.on("data", (d) => collectOutput("stdout", d));
    child.stderr.on("data", (d) => collectOutput("stderr", d));

    child.on("error", (err) => {
      if (settled) return;
      settled = true;
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
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      const runtimeMs = Number(process.hrtime.bigint() - start) / 1e6;
      const limitMessage = "\n[Runtime Error: Time limit exceeded.]";
      resolve({
        stdout,
        stderr: killedByTimeout || killedForOutput
          ? stderr + limitMessage
          : stderr,
        exitCode: killedByTimeout || killedForOutput ? 124 : code,
        timedOut: killedByTimeout || killedForOutput,
        runtimeMs: Math.round(runtimeMs),
      });
    });

    if (stdin) child.stdin.write(stdin);
    child.stdin.end();
  });
}

module.exports = { runLocally };
