const express = require("express");
const router = express.Router();

const { executeCode } = require("../execution/engine");
const { debugCode } = require("../execution/debugEngine");
const { bundleWebProject } = require("../execution/webBundler");
const { validateRunRequest } = require("../middleware/validate");
const { LANGUAGES } = require("../execution/languages");

// GET /api/compiler/languages — powers the language dropdown, no hardcoding on the frontend
router.get("/languages", (req, res) => {
  const list = Object.entries(LANGUAGES).map(([id, cfg]) => ({ id, label: cfg.label }));
  res.json({ languages: list });
});

// POST /api/compiler/run — the main execution endpoint
router.post("/run", validateRunRequest, async (req, res) => {
  const { language, code, stdin = "", html, css, js } = req.body;

  try {
    if (language === "web") {
      const bundled = bundleWebProject({ html, css, js });
      return res.json({ success: true, previewHtml: bundled });
    }

    const result = await executeCode({ language, code, stdin });
    return res.json(result);
  } catch (err) {
    console.error("[compiler/run] unexpected error:", err);
    return res.status(500).json({
      success: false,
      stderr: "Internal execution engine error. This has been logged.",
    });
  }
});

// POST /api/compiler/debug — step-through debugger (Python only for now)
router.post("/debug", async (req, res) => {
  const { language = "python", code = "", stdin = "" } = req.body;

  if (!language || !code.trim()) {
    return res.status(400).json({
      steps: [],
      totalSteps: 0,
      error: "language and code are required.",
    });
  }

  try {
    const result = await debugCode({ language, code, stdin });
    return res.json(result);
  } catch (err) {
    console.error("[compiler/debug] unexpected error:", err);
    return res.status(500).json({
      steps: [],
      totalSteps: 0,
      error: "Internal debugger engine error. This has been logged.",
    });
  }
});

module.exports = router;
