import LanguageSelector from "./LanguageSelector";
import Tooltip from "./Tooltip";
import {
  PlayIcon,
  StopIcon,
  SaveIcon,
  RotateIcon,
  DownloadIcon,
  MaximizeIcon,
  SettingsIcon,
  SunIcon,
  MoonIcon,
  LoaderIcon,
  CheckCircleIcon,
  AlertCircleIcon,
  CodeIcon,
  BugIcon,
  XCircleIcon,
} from "./Icons";

const IconBtn = ({ label, shortcut, onClick, children, active }) => (
  <Tooltip label={label} shortcut={shortcut}>
    <button
      onClick={onClick}
      aria-label={label}
      className={`icon-btn ${active ? "active" : ""}`}
    >
      {children}
    </button>
  </Tooltip>
);

export default function TopNav({
  languages,
  language,
  onLanguageChange,
  fileName,
  isRunning,
  runStatus,
  onRun,
  onStop,
  onSave,
  onReset,
  onDownload,
  onFullScreen,
  onOpenSettings,
  darkMode,
  onToggleTheme,
  // Debug props
  isDebugging = false,
  isDebugLoading = false,
  onDebug,
  onStopDebug,
}) {
  return (
    <header
      className="glass-elevated relative z-50 flex items-center justify-between px-4 py-2.5"
      style={{ borderBottom: "1px solid var(--surface-border-subtle)" }}
    >
      {/* Left: Logo + Branding */}
      <div className="flex items-center gap-3 min-w-[200px]">
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center shadow-glow"
          style={{
            background: "linear-gradient(135deg, #38BDF8 0%, #0EA5E9 100%)",
          }}
        >
          <CodeIcon size={18} style={{ color: "white" }} />
        </div>
        <div className="flex flex-col">
          <span className="font-display font-bold text-[15px] leading-tight tracking-tight" style={{ color: "var(--text-primary)" }}>
            SkyCompiler
          </span>
          <span className="text-[10px] font-medium tracking-wider uppercase" style={{ color: "var(--text-muted)" }}>
            Cloud IDE
          </span>
        </div>
      </div>

      {/* Center: language + filename */}
      <div className="flex items-center gap-3">
        <LanguageSelector
          languages={languages}
          value={language}
          onChange={onLanguageChange}
        />
        <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg" style={{ background: "var(--surface-elevated)", border: "1px solid var(--surface-border-subtle)" }}>
          <span className="text-xs font-mono" style={{ color: "var(--text-muted)" }}>
            {fileName}
          </span>
        </div>
      </div>

      {/* Right: actions */}
      <div className="flex items-center gap-1.5 min-w-[200px] justify-end">
        {/* Run / Stop button — the hero */}
        {!isRunning ? (
          <Tooltip label="Run code" shortcut="⌘↵">
            <button
              onClick={onRun}
              disabled={isDebugging}
              className="btn-run text-sm font-semibold px-5 py-2 rounded-control flex items-center gap-2"
              style={isDebugging ? { opacity: 0.4, cursor: "not-allowed" } : {}}
            >
              {runStatus === "success" ? (
                <span className="animate-success-pop"><CheckCircleIcon size={15} /></span>
              ) : runStatus === "error" ? (
                <span className="animate-shake"><AlertCircleIcon size={15} /></span>
              ) : (
                <PlayIcon size={13} />
              )}
              <span>Run</span>
            </button>
          </Tooltip>
        ) : (
          <Tooltip label="Stop execution">
            <button onClick={onStop} className="btn-stop text-sm font-semibold px-5 py-2 rounded-control flex items-center gap-2">
              <span className="run-spinner"><LoaderIcon size={14} /></span>
              <span>Running…</span>
            </button>
          </Tooltip>
        )}

        {/* Debug button — only shown for Python */}
        {language === "python" && !isDebugging && !isRunning && (
          <Tooltip label="Debug Python code step-by-step">
            <button
              onClick={onDebug}
              disabled={isDebugLoading}
              className="btn-debug text-sm font-semibold px-4 py-2 rounded-control flex items-center gap-2"
            >
              {isDebugLoading ? (
                <span className="run-spinner"><LoaderIcon size={13} /></span>
              ) : (
                <BugIcon size={13} />
              )}
              <span>{isDebugLoading ? "Tracing…" : "Debug"}</span>
            </button>
          </Tooltip>
        )}

        {/* Stop Debug button — shown while debugging */}
        {isDebugging && (
          <Tooltip label="Exit debug session">
            <button
              onClick={onStopDebug}
              className="btn-stop-debug text-sm font-semibold px-4 py-2 rounded-control flex items-center gap-2"
            >
              <XCircleIcon size={13} />
              <span>Stop Debug</span>
            </button>
          </Tooltip>
        )}

        <div style={{ width: 1, height: 20, background: "var(--surface-border)", margin: "0 4px" }} />

        <IconBtn label="Save" shortcut="⌘S" onClick={onSave}><SaveIcon size={15} /></IconBtn>
        <IconBtn label="Reset to template" onClick={onReset}><RotateIcon size={15} /></IconBtn>
        <IconBtn label="Download source" onClick={onDownload}><DownloadIcon size={15} /></IconBtn>
        <IconBtn label="Full screen" shortcut="F11" onClick={onFullScreen}><MaximizeIcon size={15} /></IconBtn>

        <div style={{ width: 1, height: 20, background: "var(--surface-border)", margin: "0 4px" }} />

        <IconBtn label="Settings" shortcut="⌘," onClick={onOpenSettings}><SettingsIcon size={15} /></IconBtn>
        <IconBtn label={darkMode ? "Light mode" : "Dark mode"} onClick={onToggleTheme} active={darkMode}>
          {darkMode ? <SunIcon size={15} /> : <MoonIcon size={15} />}
        </IconBtn>
      </div>
    </header>
  );
}
