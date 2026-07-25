export default function SettingsPanel({ open, onClose, fontSize, setFontSize, minimapEnabled, setMinimapEnabled, highContrast, setHighContrast }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-end bg-ink/10" onClick={onClose}>
      <div
        className="glass-panel rounded-panel shadow-cloud m-4 p-5 w-72"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-display font-semibold text-ink">Settings</h3>
          <button onClick={onClose} className="text-mist hover:text-ink">✕</button>
        </div>

        <label className="block text-xs text-mist mb-1">Font size ({fontSize}px)</label>
        <input
          type="range"
          min={11}
          max={24}
          value={fontSize}
          onChange={(e) => setFontSize(Number(e.target.value))}
          className="w-full mb-4 accent-sky"
        />

        <label className="flex items-center justify-between text-sm text-ink mb-3">
          Minimap
          <input type="checkbox" checked={minimapEnabled} onChange={(e) => setMinimapEnabled(e.target.checked)} className="accent-sky" />
        </label>

        <label className="flex items-center justify-between text-sm text-ink">
          High contrast mode
          <input type="checkbox" checked={highContrast} onChange={(e) => setHighContrast(e.target.checked)} className="accent-sky" />
        </label>

        <p className="text-xs text-mist mt-4">
          Keyboard: <kbd className="px-1 bg-white/70 rounded">Ctrl/Cmd+Shift+P</kbd> command palette,{" "}
          <kbd className="px-1 bg-white/70 rounded">Ctrl/Cmd+G</kbd> go to line.
        </p>
      </div>
    </div>
  );
}
