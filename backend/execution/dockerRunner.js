const { spawn } = require("child_process");

/**
 * Runs `command` inside a locked-down, single-use container.
 * The container gets NO network, a read-only root filesystem (except /workspace),
 * a hard memory cap, a CPU cap, and is force-removed the moment it exits.
 *
 * This is the path you use in production. It's also the reason sub-second
 * response times require pre-warming (see workers/pool.js) — `docker run`
 * from a cold image typically costs 150-400ms of overhead by itself.
 */
function runInDocker({ image, workspaceDir, command, stdin, timeoutMs, memoryMb }) {
  return new Promise((resolve) => {
    const args = [
      "run",
      "--rm", // auto-delete container on exit — never leaves debris
      "-i", // keep stdin open so we can pipe input
      "--network",
      "none", // no internet, no talking to other containers
      "--memory",
      `${memoryMb}m`,
      "--memory-swap",
      `${memoryMb}m`, // disable swap growth beyond the memory cap
      "--cpus",
      "1",
      "--pids-limit",
      "128", // fork-bomb protection
      "--read-only", // root fs is immutable
      "--tmpfs",
      "/tmp:rw,size=32m",
      "-v",
      `${workspaceDir}:/workspace:rw`,
      "-w",
      "/workspace",
      "--user",
      "1000:1000", // never run as root inside the container
      image,
      "sh",
      "-c",
      command,
    ];

    const child = spawn("docker", args);

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
        stderr: `Execution engine error: ${err.message}. Is Docker installed and running?`,
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

module.exports = { runInDocker };
