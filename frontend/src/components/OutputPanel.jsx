import {
  TerminalIcon,
  CopyIcon,
  DownloadIcon,
  TrashIcon,
  CheckCircleIcon,
  AlertCircleIcon,
  ClockIcon,
  CpuIcon,
  LoaderIcon,
  HashIcon,
} from "./Icons";

const StatCard = ({ icon, label, value }) => (
  <div className="stat-card">
    {icon}
    <span>{label}</span>
    <span className="stat-card-value">{value}</span>
  </div>
);

export default function OutputPanel({ result, isRunning, onCopy, onDownload, onClear, onJumpToLine }) {
  const hasCompileError = result?.compileError;
  const hasRuntimeError = !hasCompileError && result?.stderr;
  const inputRequired = result?.inputRequired;
  const status = isRunning
    ? "running"
    : hasCompileError
      ? "compile-error"
      : inputRequired
        ? "input-required"
        : hasRuntimeError
          ? "runtime-error"
          : result?.success
            ? "success"
            : "idle";

  const statusConfig = {
    idle: { color: "var(--text-muted)", label: "Ready", icon: null },
    running: { color: "var(--color-info)", label: "Running…", icon: <LoaderIcon size={12} className="run-spinner" /> },
    success: { color: "var(--color-success)", label: "Success", icon: <CheckCircleIcon size={13} className="animate-success-pop" /> },
    "runtime-error": { color: "var(--color-danger)", label: "Runtime Error", icon: <AlertCircleIcon size={13} className="animate-shake" /> },
    "compile-error": { color: "var(--color-danger)", label: "Compilation Error", icon: <AlertCircleIcon size={13} className="animate-shake" /> },
    "input-required": { color: "var(--color-warning)", label: "Input required", icon: <AlertCircleIcon size={13} /> },
  };

  const { color, label, icon } = statusConfig[status];

  return (
    <div className="flex flex-col h-full glass-panel rounded-panel overflow-hidden">
      {/* Header */}
      <div className="panel-header">
        <div className="panel-title">
          <TerminalIcon size={13} />
          <span>Output</span>
          <span
            className="flex items-center gap-1.5"
            style={{ color, fontWeight: 600, fontSize: 11, textTransform: "none", letterSpacing: 0 }}
          >
            {icon}
            {label}
          </span>
        </div>
        <div className="panel-actions">
          <button onClick={onCopy} className="panel-action-btn" title="Copy output">
            <CopyIcon size={12} />
            Copy
          </button>
          <button onClick={onDownload} className="panel-action-btn" title="Download output">
            <DownloadIcon size={12} />
            Download
          </button>

        </div>
      </div>

      {/* Stats bar */}
      {result && !isRunning && (
        <div
          className="flex flex-wrap gap-2 px-3 py-2"
          style={{ borderBottom: "1px solid var(--surface-border-subtle)" }}
        >
          <StatCard
            icon={<ClockIcon size={11} style={{ color: "var(--color-info)" }} />}
            label="Time"
            value={`${result.runtimeMs ?? 0}ms`}
          />
          {result.compileMs > 0 && (
            <StatCard
              icon={<CpuIcon size={11} style={{ color: "var(--color-warning)" }} />}
              label="Compile"
              value={`${result.compileMs}ms`}
            />
          )}
          <StatCard
            icon={<HashIcon size={11} style={{ color: "var(--text-muted)" }} />}
            label="Exit"
            value={result.exitCode ?? "—"}
          />
          {result.memoryMb && (
            <StatCard
              icon={<CpuIcon size={11} style={{ color: "var(--color-success)" }} />}
              label="Memory"
              value={`${result.memoryMb}MB`}
            />
          )}
        </div>
      )}

      {/* Output body */}
      <div className="flex-1 overflow-y-auto px-4 py-3 font-mono text-sm" style={{ color: "var(--text-primary)" }}>
        {/* Running state */}
        {isRunning && (
          <div className="flex items-center gap-2" style={{ color: "var(--color-info)" }}>
            <LoaderIcon size={14} className="run-spinner" />
            <span>Compiling & executing…</span>
          </div>
        )}

        {/* Empty state */}
        {!isRunning && !result && (
          <div className="flex flex-col items-center justify-center h-full gap-2" style={{ color: "var(--text-muted)" }}>
            <TerminalIcon size={32} style={{ opacity: 0.3 }} />
            <p className="text-xs text-center">Output will appear here after you run your code.</p>
          </div>
        )}

        {/* Compilation error */}
        {!isRunning && hasCompileError && (
          <div className="output-error animate-fadeIn">
            <pre className="whitespace-pre-wrap text-sm" style={{ color: "var(--color-danger)" }}>
              {result.compileError}
            </pre>
          </div>
        )}

        {/* Stdout */}
        {!isRunning && result?.stdout && (
          <pre className="whitespace-pre-wrap mb-2 animate-fadeIn" style={{ color: "var(--text-primary)" }}>
            {result.stdout}
          </pre>
        )}

        {/* Missing standard input */}
        {!isRunning && inputRequired && (
          <div
            className="flex items-center gap-2 px-3 py-2 rounded-lg animate-fadeIn"
            style={{ background: "var(--color-warning-bg)", color: "var(--color-warning)" }}
          >
            <AlertCircleIcon size={15} />
            <span className="text-xs font-medium">
              This program needs input. Enter a value in the Input panel, then run it again.
            </span>
          </div>
        )}

        {/* Runtime error */}
        {!isRunning && hasRuntimeError && (
          <div className="output-error animate-fadeIn">
            <pre className="whitespace-pre-wrap text-sm" style={{ color: "var(--color-danger)" }}>
              {result.stderr}
            </pre>
          </div>
        )}

        {/* Timeout warning */}
        {!isRunning && result?.timedOut && (
          <div
            className="flex items-center gap-2 mt-2 px-3 py-2 rounded-lg animate-fadeIn"
            style={{ background: "var(--color-warning-bg)", color: "var(--color-warning)" }}
          >
            <ClockIcon size={14} />
            <span className="text-xs font-medium">Execution was terminated for exceeding the time limit.</span>
          </div>
        )}

        {/* Hint */}
        {!isRunning && result?.hint && (
          <div
            className="flex items-center gap-2 mt-3 px-3 py-2 rounded-lg animate-fadeIn"
            style={{ background: "var(--color-info-bg)", color: "var(--sky-deep)" }}
          >
            <span>💡</span>
            <span className="text-xs">{result.hint}</span>
          </div>
        )}

        {/* Diagnostics — clickable jump-to-line */}
        {!isRunning && result?.diagnostics?.length > 0 && (
          <div className="mt-3 space-y-1.5 animate-fadeIn">
            {result.diagnostics.map((d, i) => (
              <button
                key={i}
                onClick={() => onJumpToLine?.(d.line)}
                className="flex items-center gap-2 w-full text-left text-xs px-3 py-2 rounded-lg transition-colors"
                style={{
                  background: "var(--color-danger-bg)",
                  color: "var(--color-danger)",
                  border: "1px solid transparent",
                }}
                onMouseOver={(e) => (e.currentTarget.style.borderColor = "var(--color-danger)")}
                onMouseOut={(e) => (e.currentTarget.style.borderColor = "transparent")}
              >
                <AlertCircleIcon size={12} />
                <span className="font-mono font-semibold">Ln {d.line}{d.column ? `:${d.column}` : ""}</span>
                <span>— {d.message}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
