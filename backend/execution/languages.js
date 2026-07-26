/**
 * Central registry of supported languages.
 *
 * fileName      -> what the student's code gets saved as
 * compile       -> shell command run inside the workspace before execution (null = skip)
 * run           -> shell command that executes the compiled/interpreted program
 * dockerImage   -> image used in DOCKER_MODE (see docker/ folder for Dockerfiles)
 * timeoutMs     -> hard wall-clock kill switch (this is your "under a second" lever for
 *                  interpreted languages; compiled languages spend part of the budget compiling)
 * memoryMb      -> hard memory ceiling enforced via `docker run --memory`
 *
 * Adding a language = add an entry here + a Dockerfile in docker/<lang>/. Nothing else
 * in the request pipeline needs to change.
 */

const LANGUAGES = {
  python: {
    label: "Python",
    fileName: "main.py",
    compile: null,
    // Windows commonly exposes the real interpreter as `python`, while
    // `python3` may only be a Microsoft Store alias. Docker/Linux use python3.
    run: process.platform === "win32" ? "python main.py" : "python3 main.py",
    dockerImage: "skycompiler-python:latest",
    timeoutMs: 5000,
    memoryMb: 256,
  },
  c: {
    label: "C",
    fileName: "main.c",
    compile: "gcc main.c -O2 -o main",
    run: "./main",
    dockerImage: "skycompiler-c:latest",
    timeoutMs: 5000,
    memoryMb: 256,
  },
  cpp: {
    label: "C++",
    fileName: "main.cpp",
    compile: "g++ main.cpp -O2 -o main",
    run: "./main",
    dockerImage: "skycompiler-cpp:latest",
    timeoutMs: 5000,
    memoryMb: 256,
  },
  java: {
    label: "Java",
    fileName: "Main.java",
    compile: "javac Main.java",
    run: "java Main",
    dockerImage: "skycompiler-java:latest",
    timeoutMs: 8000, // JVM startup is the tax here — see README "Why Java feels slower"
    memoryMb: 384,
  },
  javascript: {
    label: "JavaScript",
    fileName: "main.js",
    compile: null,
    run: "node main.js",
    dockerImage: "skycompiler-node:latest",
    timeoutMs: 5000,
    memoryMb: 256,
  },
  typescript: {
    label: "TypeScript",
    fileName: "main.ts",
    compile: null,
    run: "ts-node main.ts",
    dockerImage: "skycompiler-node:latest",
    timeoutMs: 6000,
    memoryMb: 384,
  },
  sql: {
    label: "SQL",
    fileName: "query.sql",
    compile: null,
    run: "sqlite3 database.db < query.sql",
    dockerImage: "skycompiler-sqlite:latest",
    timeoutMs: 3000,
    memoryMb: 128,
  },
  go: {
    label: "Go",
    fileName: "main.go",
    compile: "go build -o main main.go",
    run: "./main",
    dockerImage: "skycompiler-go:latest",
    timeoutMs: 5000,
    memoryMb: 256,
  },
  rust: {
    label: "Rust",
    fileName: "main.rs",
    compile: "rustc main.rs",
    run: "./main",
    dockerImage: "skycompiler-rust:latest",
    timeoutMs: 8000,
    memoryMb: 384,
  },
  kotlin: {
    label: "Kotlin",
    fileName: "main.kt",
    compile: "kotlinc main.kt -include-runtime -d main.jar",
    run: "java -jar main.jar",
    dockerImage: "skycompiler-kotlin:latest",
    timeoutMs: 8000,
    memoryMb: 384,
  },
  swift: {
    label: "Swift",
    fileName: "main.swift",
    compile: null,
    run: "swift main.swift",
    dockerImage: "skycompiler-swift:latest",
    timeoutMs: 5000,
    memoryMb: 256,
  },
  php: {
    label: "PHP",
    fileName: "main.php",
    compile: null,
    run: "php main.php",
    dockerImage: "skycompiler-php:latest",
    timeoutMs: 3000,
    memoryMb: 128,
  },
  ruby: {
    label: "Ruby",
    fileName: "main.rb",
    compile: null,
    run: "ruby main.rb",
    dockerImage: "skycompiler-ruby:latest",
    timeoutMs: 3000,
    memoryMb: 128,
  },
  csharp: {
    label: "C#",
    fileName: "Program.cs",
    compile: "csc Program.cs",
    run: "mono Program.exe",
    dockerImage: "skycompiler-csharp:latest",
    timeoutMs: 8000,
    memoryMb: 384,
  },
  bash: {
    label: "Bash",
    fileName: "script.sh",
    compile: null,
    run: "bash script.sh",
    dockerImage: "skycompiler-bash:latest",
    timeoutMs: 3000,
    memoryMb: 128,
  },
  dart: {
    label: "Dart",
    fileName: "main.dart",
    compile: null,
    run: "dart run main.dart",
    dockerImage: "skycompiler-dart:latest",
    timeoutMs: 5000,
    memoryMb: 256,
  },
  // "web" is not executed by the run-pipeline below — see routes/compiler.js webHandler.
  web: {
    label: "Web (HTML/CSS/JS)",
    fileName: null,
    compile: null,
    run: null,
    dockerImage: null,
    timeoutMs: 0,
    memoryMb: 0,
  },
};

function isSupported(language) {
  return Object.prototype.hasOwnProperty.call(LANGUAGES, language);
}

module.exports = { LANGUAGES, isSupported };
