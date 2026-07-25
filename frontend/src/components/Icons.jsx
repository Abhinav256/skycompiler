/**
 * Icons.jsx — Professional SVG icon library for SkyCompiler.
 * Replaces all emoji usage with crisp, scalable vector icons.
 * Each icon accepts `size` and `className` props.
 */

const defaultProps = { size: 16, className: "" };

const wrap = (path, { size = 16, className = "", viewBox = "0 0 24 24", ...rest } = {}) => (
  <svg
    width={size}
    height={size}
    viewBox={viewBox}
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    {...rest}
  >
    {path}
  </svg>
);

// ── Action Icons ──────────────────────────────────────────────
export const PlayIcon = (props) =>
  wrap(<polygon points="6 3 20 12 6 21 6 3" fill="currentColor" stroke="none" />, props);

export const StopIcon = (props) =>
  wrap(<rect x="6" y="6" width="12" height="12" rx="1" fill="currentColor" stroke="none" />, props);

export const SaveIcon = (props) =>
  wrap(
    <>
      <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
      <polyline points="17 21 17 13 7 13 7 21" />
      <polyline points="7 3 7 8 15 8" />
    </>,
    props
  );

export const RotateIcon = (props) =>
  wrap(
    <>
      <polyline points="1 4 1 10 7 10" />
      <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
    </>,
    props
  );

export const DownloadIcon = (props) =>
  wrap(
    <>
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="7 10 12 15 17 10" />
      <line x1="12" y1="15" x2="12" y2="3" />
    </>,
    props
  );

export const MaximizeIcon = (props) =>
  wrap(
    <>
      <polyline points="15 3 21 3 21 9" />
      <polyline points="9 21 3 21 3 15" />
      <line x1="21" y1="3" x2="14" y2="10" />
      <line x1="3" y1="21" x2="10" y2="14" />
    </>,
    props
  );

export const SettingsIcon = (props) =>
  wrap(
    <>
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </>,
    props
  );

export const SunIcon = (props) =>
  wrap(
    <>
      <circle cx="12" cy="12" r="5" />
      <line x1="12" y1="1" x2="12" y2="3" />
      <line x1="12" y1="21" x2="12" y2="23" />
      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
      <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
      <line x1="1" y1="12" x2="3" y2="12" />
      <line x1="21" y1="12" x2="23" y2="12" />
      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
      <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
    </>,
    props
  );

export const MoonIcon = (props) =>
  wrap(<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />, props);

export const XIcon = (props) =>
  wrap(
    <>
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </>,
    props
  );

export const CopyIcon = (props) =>
  wrap(
    <>
      <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </>,
    props
  );

export const TrashIcon = (props) =>
  wrap(
    <>
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    </>,
    props
  );

export const SearchIcon = (props) =>
  wrap(
    <>
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </>,
    props
  );

export const ChevronDownIcon = (props) =>
  wrap(<polyline points="6 9 12 15 18 9" />, props);

// ── Panel Icons ───────────────────────────────────────────────
export const TerminalIcon = (props) =>
  wrap(
    <>
      <polyline points="4 17 10 11 4 5" />
      <line x1="12" y1="19" x2="20" y2="19" />
    </>,
    props
  );

export const InputIcon = (props) =>
  wrap(
    <>
      <path d="M4 7V4a2 2 0 0 1 2-2h8.5L20 7.5V20a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-3" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="2" y1="12" x2="12" y2="12" />
      <polyline points="9 9 12 12 9 15" />
    </>,
    props
  );

export const CodeIcon = (props) =>
  wrap(
    <>
      <polyline points="16 18 22 12 16 6" />
      <polyline points="8 6 2 12 8 18" />
    </>,
    props
  );

export const GlobeIcon = (props) =>
  wrap(
    <>
      <circle cx="12" cy="12" r="10" />
      <line x1="2" y1="12" x2="22" y2="12" />
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
    </>,
    props
  );

export const RefreshIcon = (props) =>
  wrap(
    <>
      <polyline points="23 4 23 10 17 10" />
      <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
    </>,
    props
  );

export const ExternalLinkIcon = (props) =>
  wrap(
    <>
      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
      <polyline points="15 3 21 3 21 9" />
      <line x1="10" y1="14" x2="21" y2="3" />
    </>,
    props
  );

// ── Status Icons ──────────────────────────────────────────────
export const CheckCircleIcon = (props) =>
  wrap(
    <>
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </>,
    props
  );

export const AlertCircleIcon = (props) =>
  wrap(
    <>
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="12" />
      <line x1="12" y1="16" x2="12.01" y2="16" />
    </>,
    props
  );

export const ClockIcon = (props) =>
  wrap(
    <>
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </>,
    props
  );

export const CpuIcon = (props) =>
  wrap(
    <>
      <rect x="4" y="4" width="16" height="16" rx="2" ry="2" />
      <rect x="9" y="9" width="6" height="6" />
      <line x1="9" y1="1" x2="9" y2="4" />
      <line x1="15" y1="1" x2="15" y2="4" />
      <line x1="9" y1="20" x2="9" y2="23" />
      <line x1="15" y1="20" x2="15" y2="23" />
      <line x1="20" y1="9" x2="23" y2="9" />
      <line x1="20" y1="14" x2="23" y2="14" />
      <line x1="1" y1="9" x2="4" y2="9" />
      <line x1="1" y1="14" x2="4" y2="14" />
    </>,
    props
  );

export const ZapIcon = (props) =>
  wrap(<polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" fill="currentColor" stroke="none" />, props);

export const WifiIcon = (props) =>
  wrap(
    <>
      <path d="M5 12.55a11 11 0 0 1 14.08 0" />
      <path d="M1.42 9a16 16 0 0 1 21.16 0" />
      <path d="M8.53 16.11a6 6 0 0 1 6.95 0" />
      <line x1="12" y1="20" x2="12.01" y2="20" />
    </>,
    props
  );

export const WifiOffIcon = (props) =>
  wrap(
    <>
      <line x1="1" y1="1" x2="23" y2="23" />
      <path d="M16.72 11.06A10.94 10.94 0 0 1 19 12.55" />
      <path d="M5 12.55a10.94 10.94 0 0 1 5.17-2.39" />
      <path d="M10.71 5.05A16 16 0 0 1 22.56 9" />
      <path d="M1.42 9a15.91 15.91 0 0 1 4.7-2.88" />
      <path d="M8.53 16.11a6 6 0 0 1 6.95 0" />
      <line x1="12" y1="20" x2="12.01" y2="20" />
    </>,
    props
  );

// ── Device Icons ──────────────────────────────────────────────
export const MonitorIcon = (props) =>
  wrap(
    <>
      <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
      <line x1="8" y1="21" x2="16" y2="21" />
      <line x1="12" y1="17" x2="12" y2="21" />
    </>,
    props
  );

export const TabletIcon = (props) =>
  wrap(
    <>
      <rect x="4" y="2" width="16" height="20" rx="2" ry="2" />
      <line x1="12" y1="18" x2="12.01" y2="18" />
    </>,
    props
  );

export const SmartphoneIcon = (props) =>
  wrap(
    <>
      <rect x="5" y="2" width="14" height="20" rx="2" ry="2" />
      <line x1="12" y1="18" x2="12.01" y2="18" />
    </>,
    props
  );

export const LockIcon = (props) =>
  wrap(
    <>
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </>,
    props
  );

// ── Misc Icons ────────────────────────────────────────────────
export const LoaderIcon = (props) =>
  wrap(
    <>
      <line x1="12" y1="2" x2="12" y2="6" />
      <line x1="12" y1="18" x2="12" y2="22" />
      <line x1="4.93" y1="4.93" x2="7.76" y2="7.76" />
      <line x1="16.24" y1="16.24" x2="19.07" y2="19.07" />
      <line x1="2" y1="12" x2="6" y2="12" />
      <line x1="18" y1="12" x2="22" y2="12" />
      <line x1="4.93" y1="19.07" x2="7.76" y2="16.24" />
      <line x1="16.24" y1="7.76" x2="19.07" y2="4.93" />
    </>,
    props
  );

export const HashIcon = (props) =>
  wrap(
    <>
      <line x1="4" y1="9" x2="20" y2="9" />
      <line x1="4" y1="15" x2="20" y2="15" />
      <line x1="10" y1="3" x2="8" y2="21" />
      <line x1="16" y1="3" x2="14" y2="21" />
    </>,
    props
  );

export const FileTextIcon = (props) =>
  wrap(
    <>
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
      <polyline points="10 9 9 9 8 9" />
    </>,
    props
  );

// ── Language Icons (colored filled icons) ─────────────────────
// These use viewBox and filled shapes for recognizable language branding.

export const LANG_ICONS = {
  python: "🐍",
  c: "C",
  cpp: "C++",
  java: "☕",
  javascript: "JS",
  typescript: "TS",
  html: "<>",
  css: "#",
  sql: "⛁",
  go: "Go",
  rust: "🦀",
  kotlin: "K",
  swift: "🐦",
  php: "🐘",
  ruby: "💎",
  csharp: "C#",
  bash: "$_",
  dart: "🎯",
  web: "🌐",
};

export const LANG_COLORS = {
  python: "#3776AB",
  c: "#555555",
  cpp: "#00599C",
  java: "#E76F00",
  javascript: "#F7DF1E",
  typescript: "#3178C6",
  html: "#E34F26",
  css: "#1572B6",
  sql: "#CC6699",
  go: "#00ADD8",
  rust: "#CE412B",
  kotlin: "#7F52FF",
  swift: "#F05138",
  php: "#777BB4",
  ruby: "#CC342D",
  csharp: "#239120",
  bash: "#4EAA25",
  dart: "#0175C2",
  web: "#38BDF8",
};
