const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

export async function runCode({ language, code, stdin, html, css, js }) {
  const res = await fetch(`${BASE_URL}/api/compiler/run`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ language, code, stdin, html, css, js }),
  });

  if (!res.ok) {
    const errBody = await res.json().catch(() => ({}));
    return {
      success: false,
      stdout: "",
      stderr: errBody.stderr || `Request failed with status ${res.status}`,
      compileError: "",
      diagnostics: [],
    };
  }

  return res.json();
}

export async function fetchLanguages() {
  const res = await fetch(`${BASE_URL}/api/compiler/languages`);
  if (!res.ok) return { languages: [] };
  return res.json();
}
