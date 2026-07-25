const { isSupported } = require("../execution/languages");

const MAX_CODE_LENGTH = 100_000; // ~100KB — generous for a student submission
const MAX_STDIN_LENGTH = 20_000;

function validateRunRequest(req, res, next) {
  const { language, code, stdin } = req.body || {};

  if (!language || !isSupported(language)) {
    return res.status(400).json({ success: false, stderr: `Unsupported or missing language: "${language}"` });
  }
  if (language === "web") {
    // web requests are validated in the web route itself (html/css/js fields)
    return next();
  }
  if (typeof code !== "string" || code.trim().length === 0) {
    return res.status(400).json({ success: false, stderr: "Code cannot be empty." });
  }
  if (code.length > MAX_CODE_LENGTH) {
    return res.status(400).json({ success: false, stderr: `Code exceeds max length of ${MAX_CODE_LENGTH} characters.` });
  }
  if (stdin && stdin.length > MAX_STDIN_LENGTH) {
    return res.status(400).json({ success: false, stderr: `Input exceeds max length of ${MAX_STDIN_LENGTH} characters.` });
  }

  next();
}

module.exports = { validateRunRequest };
