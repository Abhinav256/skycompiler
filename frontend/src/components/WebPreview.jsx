import { useState, useRef, useEffect } from "react";

const DEVICE_WIDTHS = { desktop: "100%", tablet: "768px", mobile: "375px" };

export default function WebPreview({ srcDoc }) {
  const [device, setDevice] = useState("desktop");
  const [key, setKey] = useState(0); // bump to force iframe reload
  const [runtimeError, setRuntimeError] = useState(null);
  const iframeRef = useRef(null);

  useEffect(() => {
    const onMessage = (e) => {
      if (e.data?.type === "sky-preview-error") {
        setRuntimeError(`${e.data.msg}${e.data.line ? ` (line ${e.data.line})` : ""}`);
      }
    };
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, []);

  useEffect(() => setRuntimeError(null), [srcDoc]);

  return (
    <div className="flex flex-col h-full glass-panel rounded-panel overflow-hidden">
      <div className="flex items-center justify-between px-4 py-2 border-b border-white/60">
        <span className="text-xs font-semibold text-mist uppercase tracking-wide">Live Preview</span>
        <div className="flex items-center gap-2">
          <button onClick={() => setKey((k) => k + 1)} className="text-xs text-sky-deep hover:underline">↻ Refresh</button>
          <button
            onClick={() => {
              const w = window.open();
              w.document.write(srcDoc);
            }}
            className="text-xs text-sky-deep hover:underline"
          >
            Open in New Tab
          </button>
          {["desktop", "tablet", "mobile"].map((d) => (
            <button
              key={d}
              onClick={() => setDevice(d)}
              className={`text-xs px-2 py-1 rounded-control glass-control ${device === d ? "shadow-glow text-sky-deep" : "text-mist"}`}
            >
              {d === "desktop" ? "🖥" : d === "tablet" ? "📱" : "📲"}
            </button>
          ))}
        </div>
      </div>

      {runtimeError && (
        <div className="px-4 py-1.5 text-xs text-danger bg-danger/10 border-b border-white/50">
          ⚠ {runtimeError}
        </div>
      )}

      <div className="flex-1 overflow-auto flex justify-center bg-white/30 p-2">
        <iframe
          key={key}
          ref={iframeRef}
          title="preview"
          srcDoc={srcDoc}
          sandbox="allow-scripts"
          style={{ width: DEVICE_WIDTHS[device], height: "100%", border: "none", background: "white" }}
          className="rounded-lg shadow-cloud transition-all duration-300"
        />
      </div>
    </div>
  );
}
