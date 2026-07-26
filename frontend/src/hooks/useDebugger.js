/**
 * useDebugger.js — Central state machine for the SkyCompiler step debugger.
 *
 * State model:
 *   idle        → not debugging, no timeline loaded
 *   loading     → sent request to backend, waiting for steps
 *   active      → timeline loaded, user can navigate
 *   error       → backend returned an error (syntax error, timeout, etc.)
 *
 * The hook is intentionally kept as a thin state manager. All rendering
 * decisions live in the components. Future features (breakpoints, watch
 * expressions, call stack) can be added here without touching components.
 */

import { useState, useCallback, useMemo } from "react";
import { debugCode } from "../lib/debugApi";

const INITIAL_STATE = {
  phase: "idle",      // "idle" | "loading" | "active" | "error"
  timeline: [],       // immutable array of step objects from backend
  currentIndex: 0,    // which step is currently displayed
  error: null,        // string | null
  truncated: false,   // true if backend hit the 2000-step cap
};

export function useDebugger() {
  const [state, setState] = useState(INITIAL_STATE);

  // ── Actions ─────────────────────────────────────────────────────────────────

  /** Start a new debug session: send code to backend, load timeline. */
  const startDebug = useCallback(async (code, stdin) => {
    setState((s) => ({ ...s, phase: "loading", error: null }));

    const result = await debugCode({ code, stdin });

    if (result.error && result.steps.length === 0) {
      setState((s) => ({ ...s, phase: "error", error: result.error }));
      return;
    }

    setState({
      phase: "active",
      timeline: result.steps,
      currentIndex: 0,
      error: result.error,   // may be a warning even with valid steps
      truncated: result.truncated || false,
    });
  }, []);

  /** Exit debug mode and reset all state. */
  const exitDebug = useCallback(() => {
    setState(INITIAL_STATE);
  }, []);

  /** Jump to a specific step index (clamped to valid range). */
  const goTo = useCallback((index) => {
    setState((s) => {
      if (s.phase !== "active") return s;
      const clamped = Math.max(0, Math.min(index, s.timeline.length - 1));
      return { ...s, currentIndex: clamped };
    });
  }, []);

  const goNext = useCallback(() => {
    setState((s) => {
      if (s.phase !== "active") return s;
      return { ...s, currentIndex: Math.min(s.currentIndex + 1, s.timeline.length - 1) };
    });
  }, []);

  const goPrev = useCallback(() => {
    setState((s) => {
      if (s.phase !== "active") return s;
      return { ...s, currentIndex: Math.max(s.currentIndex - 1, 0) };
    });
  }, []);

  const goFirst = useCallback(() => {
    setState((s) => s.phase === "active" ? { ...s, currentIndex: 0 } : s);
  }, []);

  const goLast = useCallback(() => {
    setState((s) =>
      s.phase === "active"
        ? { ...s, currentIndex: s.timeline.length - 1 }
        : s
    );
  }, []);

  // ── Derived values ───────────────────────────────────────────────────────────

  const currentStep = useMemo(
    () => state.timeline[state.currentIndex] ?? null,
    [state.timeline, state.currentIndex]
  );

  /** Set of all line numbers that have been executed UP TO the current step. */
  const executedLines = useMemo(() => {
    const lines = new Set();
    for (let i = 0; i < state.currentIndex; i++) {
      if (state.timeline[i]?.line) lines.add(state.timeline[i].line);
    }
    return lines;
  }, [state.timeline, state.currentIndex]);

  const isAtFirst = state.currentIndex === 0;
  const isAtLast = state.currentIndex === state.timeline.length - 1;
  const totalSteps = state.timeline.length;

  return {
    // State
    phase: state.phase,
    isDebugging: state.phase === "active",
    isLoading: state.phase === "loading",
    isError: state.phase === "error",
    error: state.error,
    truncated: state.truncated,

    // Step navigation
    currentIndex: state.currentIndex,
    totalSteps,
    currentStep,
    executedLines,
    isAtFirst,
    isAtLast,

    // Actions
    startDebug,
    exitDebug,
    goTo,
    goNext,
    goPrev,
    goFirst,
    goLast,
  };
}
