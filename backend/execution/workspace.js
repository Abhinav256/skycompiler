const fs = require("fs/promises");
const path = require("path");
const os = require("os");

const TEMP_ROOT = process.env.TEMP_ROOT || path.join(os.tmpdir(), "skycompiler");

async function createWorkspace(executionId) {
  const dir = path.join(TEMP_ROOT, executionId);
  await fs.mkdir(dir, { recursive: true });
  return dir;
}

async function writeSourceFiles(dir, files) {
  // files: { "main.py": "print(1)" } or multiple for web
  await Promise.all(
    Object.entries(files).map(([name, content]) =>
      fs.writeFile(path.join(dir, name), content ?? "", "utf8")
    )
  );
}

async function destroyWorkspace(dir) {
  try {
    await fs.rm(dir, { recursive: true, force: true });
  } catch (err) {
    // Never let cleanup failure break the response — log and move on.
    console.error(`[cleanup] failed to remove ${dir}:`, err.message);
  }
}

module.exports = { createWorkspace, writeSourceFiles, destroyWorkspace, TEMP_ROOT };
