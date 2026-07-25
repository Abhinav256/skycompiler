/**
 * LoadingScreen.jsx — Premium splash screen while Monaco initializes.
 * Fades out with a smooth transition once the editor is ready.
 */
export default function LoadingScreen({ ready }) {
  return (
    <div className={`loading-screen ${ready ? "fade-out" : ""}`}>
      {/* Animated logo */}
      <div className="loading-logo flex flex-col items-center gap-4">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-sky to-sky-azure flex items-center justify-center shadow-glow">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="16 18 22 12 16 6" />
            <polyline points="8 6 2 12 8 18" />
          </svg>
        </div>
        <div className="flex flex-col items-center gap-1">
          <h1 className="font-display font-bold text-2xl tracking-tight" style={{ color: 'var(--text-primary)' }}>
            SkyCompiler
          </h1>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
            Preparing your coding environment…
          </p>
        </div>
      </div>

      {/* Shimmer loading bar */}
      <div className="loading-bar" />
    </div>
  );
}
