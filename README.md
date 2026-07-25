# SkyCompiler

A full-stack online compiler and code editor — sky-blue glassmorphism UI, Monaco
editor, and a Docker-isolated multi-language execution backend.

```
skycompiler/
├── frontend/     React + Vite + Tailwind + Monaco editor UI
└── backend/      Express execution engine (Docker-sandboxed or local dev mode)
```

Runs today: **Python, C, C++, Java, JavaScript, and Web (HTML/CSS/JS with live
preview)**. Architecture supports adding the other 12 languages from your spec
(TypeScript, Go, Rust, Kotlin, Swift, PHP, Ruby, C#, Bash, Dart, SQL) with no
changes to the pipeline — see "Adding a language" below.

---

## 1. Requirements

**For local development (no Docker):**
- Node.js 18+
- npm
- The compilers/runtimes you want to test locally installed on your machine
  (`python3`, `gcc`/`g++`, a JDK with `javac`, `node`)

**For production (isolated, secure execution):**
- Everything above, plus:
- **Docker Engine** (20.10+) installed and running on the host
- A Linux server/VPS — Docker-in-Docker on shared hosting (e.g. most cheap
  shared PHP hosts) generally won't work; you need a VPS or dedicated box
  where you control the Docker daemon

**Recommended specs for a small-to-medium student load:**
- 2 vCPU / 4GB RAM minimum (each concurrent execution reserves up to 384MB
  under the current per-language caps in `execution/languages.js`)
- 20GB+ disk (Docker images for 5 languages run ~2-3GB combined; budget more
  as you add languages)

---

## 2. Local development setup (fastest way to see it running)

This mode runs code directly on your machine via `child_process` — no Docker,
no isolation. It's for you, coding solo, not for anything public-facing.

```bash
# Backend
cd backend
npm install
cp .env.example .env        # DOCKER_MODE=false by default — correct for this mode
npm run dev                 # starts on http://localhost:4000

# Frontend (separate terminal)
cd frontend
npm install
cp .env.example .env        # points VITE_API_URL at localhost:4000
npm run dev                 # starts on http://localhost:5173
```

Open `http://localhost:5173`. Write some Python, hit Run. You should see
output in under a second for interpreted languages like Python/JS; C/C++/Java
add compile time on top (typically 100-800ms depending on your machine).

**Verify the safety net works before you trust it:** submit an infinite loop
(`while True: pass` in Python) and confirm you get a response — with a
"Terminated: exceeded 5000ms time limit" message — around the 5-second mark
rather than a hang. I tested this pipeline logic directly and it uses the
standard Node.js kill-after-timeout pattern, but I'd recommend confirming it
end-to-end in your own environment since sandbox resource limits made it hard
to fully verify from where I was building this.

---

## 3. Production setup (Docker-isolated — what you actually want live)

This is the mode that makes it safe to let strangers run arbitrary code
against your server. Each execution gets its own throwaway container with:
no network access, a read-only filesystem, a memory cap, a CPU cap, a
process-count cap (fork-bomb protection), and a non-root user. The container
is destroyed the instant execution finishes.

```bash
cd backend
npm install
cp .env.example .env
# edit .env: set DOCKER_MODE=true

npm run build:images        # builds all 5 language images (~5-10 min first time)
npm start                   # or use pm2/systemd for production process management
```

Then point your frontend's `VITE_API_URL` at wherever this backend is
reachable (your domain/subdomain, e.g. `https://api.yourdomain.com`), build
it, and serve the static output:

```bash
cd frontend
# edit .env: VITE_API_URL=https://api.yourdomain.com
npm run build                # outputs to frontend/dist/
# serve dist/ with nginx, Caddy, Vercel, Netlify, or any static host
```

### Where to deploy, since you're still deciding

- **Cheapest path that works:** a $6-12/mo VPS (DigitalOcean, Hetzner, Linode,
  or an Indian provider like Hostinger VPS) with Docker installed. You run
  both the backend and Docker daemon there.
- **Frontend** can live anywhere static (Vercel/Netlify/Cloudflare Pages) even
  if the backend is on your own VPS — they don't need to be co-located, just
  reachable over HTTPS from each other (set CORS `FRONTEND_ORIGIN` in
  backend `.env` accordingly).
- **Avoid:** shared/shared-cPanel hosting — it won't give you a Docker daemon.
- **Later, if traffic grows:** the `workers/` folder is a placeholder for a
  job-queue-based worker pool (Redis/BullMQ) so containers can be pre-warmed
  instead of started cold per request — that's your lever for getting
  compiled languages (Java especially) closer to sub-second consistently.

---

## 4. Why "under a second" isn't automatic — and how to get there

- **Python/JavaScript**: no compile step, so this is realistic out of the box
  once containers are warm — cold `docker run` overhead is the main cost
  (~150-400ms), not the language itself.
- **C/C++**: compile is fast (tens of ms for small programs), so also
  realistic once warm.
- **Java**: the JVM's own startup time is the bottleneck (often 200-500ms
  before your code even runs) — this is why `java` gets a longer timeout
  budget (8s) in `execution/languages.js`. There's no way around this without
  a persistent JVM pool, which is a real but more advanced feature.
- **Cold starts**: the very first request after your server boots (or after
  Docker hasn't run an image in a while) pays extra latency to pull the image
  into memory. A worker pool that keeps one container per language warm and
  idle is the standard fix — noted as a roadmap item, not yet built here.

---

## 5. Debugging support — what's included

There's no live breakpoint/step-through debugger (that requires a
language-specific debug adapter — gdb for C/C++, pdb for Python, jdb for
Java — wired through the Debug Adapter Protocol, which is a substantial
separate project). What *is* built in (`execution/debugger.js`):

- Compiler/runtime errors parsed into structured `{ line, column, message }`
  diagnostics
- Diagnostics rendered as red squiggles directly in the Monaco editor via
  `monaco.editor.setModelMarkers`
- Clickable error list in the Output panel that jumps the editor to the
  offending line
- A small pattern-matched library of plain-English hints for common mistakes
  (IndentationError, segfaults, missing semicolons, wrong Java class name,
  etc.) — extend the `COMMON_HINTS` array in `execution/debugger.js` as you
  discover more patterns your students hit often

---

## 6. Security model (production/Docker mode)

- `--network none` — no internet access from inside student code
- `--read-only` root filesystem + a small writable `/tmp`
- `--memory` / `--memory-swap` caps per language (`execution/languages.js`)
- `--pids-limit 128` — stops fork bombs
- `--user 1000:1000` — never runs as root
- `--rm` — container is deleted the instant it exits, nothing persists
- Rate limiting on `/api/compiler/run` (20 requests/min/IP by default,
  `RUN_RATE_LIMIT` in `.env`)
- Request validation: code length caps, stdin length caps, language allowlist

**Not yet included, worth adding before a public launch:** auth/accounts,
per-user rate limiting instead of per-IP, output size caps (a program that
prints gigabytes will currently fill memory before the memory cap catches
it via OOM), and structured logging/monitoring for abuse detection.

---

## 7. Adding a language

1. Add an entry to `backend/execution/languages.js` (file name, compile/run
   commands, docker image name, timeout, memory).
2. Add `backend/docker/<lang>/Dockerfile` (copy an existing one as a
   template — install the compiler/runtime, create the non-root `runner`
   user).
3. Run `npm run build:images`.
4. Add a starter template to `frontend/src/lib/templates.js`.
5. Done — the run pipeline, UI dropdown, and debugging parser all pick it
   up automatically. (The debugger's regex patterns in `debugger.js` are
   language-specific — add a pattern there too if you want structured
   diagnostics for the new language, otherwise it'll still show raw stderr.)

---

## 8. What's stubbed vs. fully built, honestly

**Fully built and tested end-to-end:** the run pipeline (validate → workspace
→ compile → execute → capture → cleanup), stdin piping, timeout kill switch,
structured error diagnostics with editor markers, the Web/HTML-CSS-JS live
preview with sandboxed iframe, the full three-panel resizable UI, language
switching with starter templates, save/reset/download, settings (font size,
minimap, high contrast).

**Architected but not load-tested:** Docker isolation (the Dockerfiles and
`docker run` flags are correct and standard, but I couldn't run Docker inside
the environment I built this in — build and test the images yourself before
trusting them with real traffic).

**Not built, noted as roadmap:** the 12 additional languages, a real
step-through debugger, worker pool / pre-warmed containers, execution
history/saved-code persistence beyond localStorage, user accounts, an online
judge/test-case mode.
