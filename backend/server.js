require("dotenv").config();
const express = require("express");
const cors = require("cors");
const rateLimit = require("express-rate-limit");

const compilerRoutes = require("./routes/compiler");

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors({ origin: process.env.FRONTEND_ORIGIN || "http://localhost:5173" }));
app.use(express.json({ limit: "1mb" }));

// Blunt but effective: caps how fast one client can fire executions.
// Tune per your traffic; this is what stops someone from turning "Run"
// into a denial-of-service or a crypto-mining botnet.
const runLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: Number(process.env.RUN_RATE_LIMIT || 20), // 20 runs/minute/IP by default
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, stderr: "Too many executions — please slow down and try again shortly." },
});

app.use("/api/compiler/run", runLimiter);
app.use("/api/compiler/debug", runLimiter);
app.use("/api/compiler", compilerRoutes);

app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    dockerMode: process.env.DOCKER_MODE === "true",
  });
});

app.listen(PORT, () => {
  console.log(`SkyCompiler backend listening on :${PORT}`);
  console.log(`Execution mode: ${process.env.DOCKER_MODE === "true" ? "DOCKER (isolated)" : "LOCAL (dev only — not sandboxed)"}`);
});
