/**
 * Tooltip.jsx — Accessible tooltip with optional keyboard shortcut badge.
 * Wraps any element and shows a floating label on hover.
 */
export default function Tooltip({ label, shortcut, position = "above", children }) {
  return (
    <div className="tooltip-wrapper">
      {children}
      <div className={`tooltip-content ${position === "below" ? "tooltip-below" : ""}`}>
        {label}
        {shortcut && <span className="kbd">{shortcut}</span>}
      </div>
    </div>
  );
}
