/**
 * DebugPanel.jsx — Right-side debug information panel for SkyCompiler.
 *
 * Replaces the Output panel when a debug session is active. Shows:
 *   1. Variables section — table of name → type badge → ObjectViewer value
 *   2. Program Output   — cumulative stdout up to the current step
 *   3. Exception        — red banner if the current step has an error
 *
 * ObjectViewer renders Python values recursively:
 *   - Primitives (int, float, bool, str, NoneType) → inline colored value
 *   - list / tuple → indexed tree
 *   - dict         → key-value tree
 *   - set / frozenset → item tree
 *   - Custom class → attribute tree
 *   - Nested structures → collapsible at depth 1+
 */

import { useState, useCallback } from "react";
import { TerminalIcon, AlertCircleIcon, ListIcon } from "./Icons";

// ── Type badge colors ──────────────────────────────────────────────────────────
const TYPE_COLORS = {
  int: { bg: "rgba(56,189,248,0.12)", text: "#0EA5E9" },
  float: { bg: "rgba(251,191,36,0.12)", text: "#D97706" },
  bool: { bg: "rgba(168,85,247,0.12)", text: "#9333EA" },
  str: { bg: "rgba(34,197,94,0.12)", text: "#16A34A" },
  NoneType: { bg: "rgba(148,163,184,0.12)", text: "#94A3B8" },
  list: { bg: "rgba(14,165,233,0.12)", text: "#0369A1" },
  tuple: { bg: "rgba(99,102,241,0.12)", text: "#4F46E5" },
  dict: { bg: "rgba(249,115,22,0.12)", text: "#C2410C" },
  set: { bg: "rgba(20,184,166,0.12)", text: "#0D9488" },
  frozenset: { bg: "rgba(20,184,166,0.12)", text: "#0D9488" },
  function: { bg: "rgba(148,163,184,0.12)", text: "#94A3B8" },
};

function TypeBadge({ typeName }) {
  const colors = TYPE_COLORS[typeName] || { bg: "rgba(148,163,184,0.12)", text: "#8BADBF" };
  return (
    <span
      className="debug-type-badge"
      style={{ background: colors.bg, color: colors.text }}
    >
      {typeName}
    </span>
  );
}

// ── Object Viewer ──────────────────────────────────────────────────────────────

function PrimitiveValue({ node }) {
  const colors = TYPE_COLORS[node.type] || { text: "var(--text-primary)" };
  let display = node.repr ?? String(node.value);
  // Strip outer quotes for str display to avoid double-quoting
  if (node.type === "str") {
    display = `"${node.value ?? ""}"`;
    if (node.length > 300) display += ` (${node.length} chars)`;
  }
  return (
    <span className="ov-primitive" style={{ color: colors.text }}>
      {display}
    </span>
  );
}

function CollectionNode({ node, depth = 0, label }) {
  const [expanded, setExpanded] = useState(depth < 2);
  const isExpandable = depth < 4;
  const hasItems = (node.items?.length > 0) || (node.pairs?.length > 0) || (node.attrs && Object.keys(node.attrs).length > 0);

  if (!hasItems) {
    // Empty collection
    const empty = node.type === "dict" ? "{}" : node.type === "set" ? "set()" : "[]";
    return <span className="ov-primitive" style={{ color: "var(--text-muted)" }}>{empty}</span>;
  }

  const toggle = (e) => { e.stopPropagation(); if (isExpandable) setExpanded((v) => !v); };

  const header = (
    <button className="ov-toggle" onClick={toggle}>
      <span className="ov-arrow" style={{ transform: expanded ? "rotate(90deg)" : "rotate(0)" }}>▶</span>
      <TypeBadge typeName={node.type} />
      <span className="ov-len" style={{ color: "var(--text-muted)" }}>
        {node.length !== undefined ? `[${node.length}]` : ""}
        {node.truncated ? " (truncated)" : ""}
      </span>
    </button>
  );

  if (!expanded || !isExpandable) {
    return (
      <span className="ov-collapsed">
        {header}
      </span>
    );
  }

  return (
    <div className="ov-collection">
      {header}
      <div className="ov-children">
        {/* List / Tuple */}
        {node.items?.map((item, i) => (
          <div key={i} className="ov-row">
            <span className="ov-key">[{i}]</span>
            <ObjectViewer node={item} depth={depth + 1} />
          </div>
        ))}
        {/* Dict */}
        {node.pairs?.map((pair, i) => (
          <div key={i} className="ov-row">
            <span className="ov-key">
              <ObjectViewer node={pair.key} depth={depth + 1} inline />
            </span>
            <ObjectViewer node={pair.value} depth={depth + 1} />
          </div>
        ))}
        {/* Custom object attrs */}
        {node.attrs && Object.entries(node.attrs).map(([k, v]) => (
          <div key={k} className="ov-row">
            <span className="ov-key">.{k}</span>
            <ObjectViewer node={v} depth={depth + 1} />
          </div>
        ))}
      </div>
    </div>
  );
}

function ObjectViewer({ node, depth = 0, inline = false }) {
  if (!node) return <span style={{ color: "var(--text-muted)" }}>—</span>;

  if (node.circular) {
    return <span style={{ color: "var(--color-warning)" }}>{"<circular>"}</span>;
  }

  if (node.type === "function") {
    return <span style={{ color: "var(--text-muted)" }}>ƒ {node.repr}</span>;
  }

  const primitiveTypes = ["int", "float", "bool", "str", "NoneType"];
  if (primitiveTypes.includes(node.type) || (!node.items && !node.pairs && !node.attrs)) {
    return <PrimitiveValue node={node} />;
  }

  if (inline) {
    return <span style={{ color: "var(--text-secondary)" }}>{node.repr?.slice(0, 40) ?? node.type}</span>;
  }

  return <CollectionNode node={node} depth={depth} />;
}

// ── Variable Table ─────────────────────────────────────────────────────────────

function VariablesSection({ variables }) {
  const entries = Object.entries(variables || {});

  if (entries.length === 0) {
    return (
      <div className="debug-empty-state">
        <ListIcon size={20} style={{ opacity: 0.3 }} />
        <span>No variables yet</span>
      </div>
    );
  }

  return (
    <div className="var-table">
      <div className="var-table-header">
        <span>Name</span>
        <span>Type</span>
        <span>Value</span>
      </div>
      {entries.map(([name, node]) => (
        <div key={name} className="var-row">
          <span className="var-name">{name}</span>
          <TypeBadge typeName={node?.type ?? "?"} />
          <div className="var-value">
            <ObjectViewer node={node} depth={0} />
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Main Panel ─────────────────────────────────────────────────────────────────

export default function DebugPanel({ currentStep, isLoading, error }) {

  if (isLoading) {
    return (
      <div className="flex flex-col h-full glass-panel rounded-panel overflow-hidden">
        <div className="panel-header">
          <div className="panel-title"><ListIcon size={13} /><span>Debugger</span></div>
        </div>
        <div className="flex-1 flex items-center justify-center gap-3" style={{ color: "var(--color-info)" }}>
          <div className="run-spinner" style={{ width: 18, height: 18, border: "2px solid currentColor", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 0.7s linear infinite" }} />
          <span className="text-sm">Tracing execution…</span>
        </div>
      </div>
    );
  }

  if (error && !currentStep) {
    return (
      <div className="flex flex-col h-full glass-panel rounded-panel overflow-hidden">
        <div className="panel-header">
          <div className="panel-title"><AlertCircleIcon size={13} /><span>Debug Error</span></div>
        </div>
        <div className="flex-1 overflow-y-auto px-4 py-3">
          <div className="output-error animate-fadeIn">
            <pre className="whitespace-pre-wrap text-sm" style={{ color: "var(--color-danger)" }}>
              {error}
            </pre>
          </div>
        </div>
      </div>
    );
  }

  const variables = currentStep?.variables ?? {};
  const stdout = currentStep?.stdout ?? "";
  const exception = currentStep?.exception;
  const fnName = currentStep?.functionName;
  const event = currentStep?.event;

  return (
    <div className="flex flex-col h-full glass-panel rounded-panel overflow-hidden">
      {/* Header */}
      <div className="panel-header">
        <div className="panel-title">
          <ListIcon size={13} />
          <span>Debugger</span>
          {fnName && fnName !== "<module>" && (
            <span className="debug-fn-tag">in {fnName}()</span>
          )}
          {event === "return" && (
            <span className="debug-event-tag debug-event-return">↩ return</span>
          )}
        </div>
      </div>

      {/* Exception banner */}
      {exception && (
        <div className="debug-exception-inline">
          <AlertCircleIcon size={13} />
          <div className="flex flex-col gap-0.5">
            <span className="debug-exception-type">{exception.type}</span>
            <span className="debug-exception-msg-sm">{exception.message}</span>
          </div>
        </div>
      )}

      {/* Body */}
      <div className="flex-1 overflow-y-auto px-3 py-2">
        <VariablesSection variables={variables} />
      </div>
    </div>
  );
}
