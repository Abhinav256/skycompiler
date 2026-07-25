/**
 * CloudField.jsx — Ambient floating cloud shapes behind the UI.
 * Multiple layers with varying speeds, sizes and opacities create depth.
 * Dark mode uses subtle glowing orbs instead of white clouds.
 */
export default function CloudField() {
  const clouds = [
    { top: "5%",  left: "8%",  size: 280, cls: "animate-drift",     opacity: 0.5, delay: "0s" },
    { top: "55%", left: "75%", size: 350, cls: "animate-driftSlow",  opacity: 0.4, delay: "-5s" },
    { top: "25%", left: "50%", size: 200, cls: "animate-driftMed",   opacity: 0.35, delay: "-3s" },
    { top: "75%", left: "15%", size: 250, cls: "animate-driftSlow",  opacity: 0.4, delay: "-10s" },
    { top: "15%", left: "85%", size: 180, cls: "animate-drift",      opacity: 0.3, delay: "-7s" },
    { top: "45%", left: "30%", size: 320, cls: "animate-driftMed",   opacity: 0.25, delay: "-12s" },
    { top: "85%", left: "60%", size: 220, cls: "animate-drift",      opacity: 0.3, delay: "-15s" },
    { top: "35%", left: "5%",  size: 160, cls: "animate-driftSlow",  opacity: 0.2, delay: "-8s" },
  ];

  return (
    <div className="cloud-field" aria-hidden="true">
      {clouds.map((c, i) => (
        <div
          key={i}
          className={`cloud-shape ${c.cls}`}
          style={{
            top: c.top,
            left: c.left,
            width: c.size,
            height: c.size,
            opacity: c.opacity,
            animationDelay: c.delay,
          }}
        />
      ))}
    </div>
  );
}
