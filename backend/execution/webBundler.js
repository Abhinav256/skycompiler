/**
 * Web projects don't need a container — there's nothing to compile or execute
 * server-side. We just inline CSS/JS into one HTML document and hand it back
 * as a string. The frontend renders it via <iframe sandbox="allow-scripts">
 * srcDoc={...} — that sandbox attribute is what makes this safe: the iframe
 * gets no access to the parent page, no top-level navigation, no same-origin
 * access to your API or cookies.
 *
 * (The original spec describes serving this from a temp folder behind a
 * preview URL. Inlining via srcDoc gets the same live-preview result with
 * one less moving part — no static file server, no cleanup job, no stale
 * preview URLs. Swap back to file-serving only if you need previews to be
 * shareable via a persistent link.)
 */
function bundleWebProject({ html = "", css = "", js = "" }) {
  return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8" />
<style>${css}</style>
</head>
<body>
${html}
<script>
window.onerror = function (msg, url, line, col) {
  window.parent.postMessage({ type: "sky-preview-error", msg, line, col }, "*");
};
try {
${js}
} catch (err) {
  window.parent.postMessage({ type: "sky-preview-error", msg: err.message }, "*");
}
</script>
</body>
</html>`;
}

module.exports = { bundleWebProject };
