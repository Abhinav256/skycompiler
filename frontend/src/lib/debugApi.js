/**
 * debugApi.js — Frontend API helper for the SkyCompiler step debugger.
 * Sends user code to the backend debug endpoint and returns the full
 * execution timeline (steps array + metadata).
 */

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

/**
 * @param {{ code: string, stdin: string }} options
 * @returns {Promise<{ steps: object[], totalSteps: number, truncated: boolean, error: string|null }>}
 */
export async function debugCode({ code, stdin = "" }) {
  try {
    const res = await fetch(`${BASE_URL}/api/compiler/debug`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ language: "python", code, stdin }),
    });

    if (!res.ok) {
      const errBody = await res.json().catch(() => ({}));
      return {
        steps: [],
        totalSteps: 0,
        error: errBody.error || `Debug request failed with status ${res.status}`,
      };
    }

    return res.json();
  } catch (err) {
    return {
      steps: [],
      totalSteps: 0,
      error: `Network error: ${err.message}`,
    };
  }
}
