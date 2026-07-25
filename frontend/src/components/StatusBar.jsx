/**
 * StatusBar.jsx — Professional IDE status bar at the bottom.
 * Shows language, cursor position, encoding, backend health, etc.
 */
import { useEffect, useState } from "react";
import { LANG_ICONS, LANG_COLORS, WifiIcon, WifiOffIcon, ZapIcon } from "./Icons";

export default function StatusBar({
  language,
  cursorPosition,
  fileName,
  backendUrl,
}) {
  const [healthy, setHealthy] = useState(null); // null = checking, true/false

  useEffect(() => {
    let cancelled = false;
    const check = () => {
      fetch(`${backendUrl}/api/health`)
        .then((r) => r.ok && r.json())
        .then((d) => { if (!cancelled) setHealthy(d?.status === "ok"); })
        .catch(() => { if (!cancelled) setHealthy(false); });
    };
    check();
    const interval = setInterval(check, 30000);
    return () => { cancelled = true; clearInterval(interval); };
  }, [backendUrl]);

  const langIcon = LANG_ICONS[language] || "💻";
  const langColor = LANG_COLORS[language] || "#888";

  return (
    <footer className="status-bar">
      {/* Left side */}
      <div className="status-bar-item" style={{ gap: 6 }}>
        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            width: 18,
            height: 18,
            borderRadius: 4,
            background: langColor + "20",
            color: langColor,
            fontSize: 10,
            fontWeight: 700,
            fontFamily: "'JetBrains Mono', monospace",
          }}
        >
          {langIcon}
        </span>
        <span style={{ fontWeight: 500 }}>{language}</span>
      </div>

      <div className="status-bar-separator" />

      <div className="status-bar-item" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
        Ln {cursorPosition?.line || 1}, Col {cursorPosition?.column || 1}
      </div>

      <div className="status-bar-separator" />

      <div className="status-bar-item">
        UTF-8
      </div>

      <div className="status-bar-separator" />

      <div className="status-bar-item">
        {fileName}
      </div>

      {/* Right side — push to end */}
      <div style={{ flex: 1 }} />

      <div className="status-bar-item" style={{ gap: 5 }}>
        <ZapIcon size={12} />
        <span>Tab Size: 4</span>
      </div>

      <div className="status-bar-separator" />

      <div className="status-bar-item" style={{ gap: 5 }}>
        {healthy === null ? (
          <>
            <span className="run-spinner" style={{ width: 10, height: 10, border: '1.5px solid var(--text-muted)', borderTopColor: 'var(--sky-primary)', borderRadius: '50%', display: 'inline-block' }} />
            <span>Connecting…</span>
          </>
        ) : healthy ? (
          <>
            <WifiIcon size={12} style={{ color: "var(--color-success)" }} />
            <span style={{ color: "var(--color-success)" }}>Connected</span>
          </>
        ) : (
          <>
            <WifiOffIcon size={12} style={{ color: "var(--color-danger)" }} />
            <span style={{ color: "var(--color-danger)" }}>Disconnected</span>
          </>
        )}
      </div>
    </footer>
  );
}
