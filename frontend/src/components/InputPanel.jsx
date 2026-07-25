import { InputIcon, TrashIcon, ClockIcon, FileTextIcon } from "./Icons";

export default function InputPanel({ value, onChange, onLoadSample, onClear, history, onSelectHistory }) {
  const lineCount = (value || "").split("\n").length;

  return (
    <div className="flex flex-col h-full glass-panel rounded-panel overflow-hidden">
      <div className="panel-header">
        <div className="panel-title">
          <InputIcon size={13} />
          <span>Input</span>
          <span style={{
            fontSize: 10,
            fontFamily: "'JetBrains Mono', monospace",
            color: "var(--text-muted)",
            fontWeight: 400,
            marginLeft: 4,
          }}>
            {lineCount} {lineCount === 1 ? "line" : "lines"}
          </span>
        </div>
        <div className="panel-actions">
          {history?.length > 0 && (
            <select
              onChange={(e) => onSelectHistory(e.target.value)}
              className="panel-action-btn"
              style={{
                background: "var(--surface-elevated)",
                border: "1px solid var(--surface-border-subtle)",
                borderRadius: "var(--radius-sm)",
                padding: "3px 6px",
                cursor: "pointer",
                color: "var(--text-secondary)",
              }}
              defaultValue=""
            >
              <option value="" disabled>↻ History</option>
              {history.map((h, i) => (
                <option key={i} value={h}>{h.slice(0, 24) || "(empty)"}</option>
              ))}
            </select>
          )}
          <button onClick={onLoadSample} className="panel-action-btn">
            <FileTextIcon size={12} />
            Sample
          </button>
          <button onClick={onClear} className="panel-action-btn">
            <TrashIcon size={12} />
            Clear
          </button>
        </div>
      </div>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Type or paste stdin here…"
        className="flex-1 resize-none bg-transparent px-4 py-3 font-mono text-sm outline-none"
        style={{
          color: "var(--text-primary)",
          caretColor: "var(--sky-primary)",
        }}
        spellCheck={false}
      />
    </div>
  );
}
