import { useRef, useState, useCallback, useEffect } from "react";

/**
 * direction="horizontal" -> a vertical divider splitting left/right (editor | console)
 * direction="vertical"   -> a horizontal divider splitting top/bottom (input | output)
 */
export default function ResizableSplit({
  direction = "horizontal",
  initialRatio = 0.65,
  minRatio = 0.25,
  maxRatio = 0.85,
  first,
  second,
}) {
  const containerRef = useRef(null);
  const [ratio, setRatio] = useState(initialRatio);
  const [dragging, setDragging] = useState(false);

  useEffect(() => {
    setRatio(initialRatio);
  }, [initialRatio]);

  const isHorizontal = direction === "horizontal";

  const onMouseDown = useCallback(() => setDragging(true), []);

  useEffect(() => {
    if (!dragging) return;

    const onMouseMove = (e) => {
      const rect = containerRef.current.getBoundingClientRect();
      const pos = isHorizontal
        ? (e.clientX - rect.left) / rect.width
        : (e.clientY - rect.top) / rect.height;
      setRatio(Math.min(maxRatio, Math.max(minRatio, pos)));
    };
    const onMouseUp = () => setDragging(false);

    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup", onMouseUp);
    return () => {
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseup", onMouseUp);
    };
  }, [dragging, isHorizontal, minRatio, maxRatio]);

  return (
    <div
      ref={containerRef}
      className={`flex ${isHorizontal ? "flex-row" : "flex-col"} h-full w-full min-h-0 min-w-0`}
    >
      <div
        style={isHorizontal ? { width: `${ratio * 100}%` } : { height: `${ratio * 100}%` }}
        className="min-h-0 min-w-0 overflow-hidden"
      >
        {first}
      </div>

      <div
        onMouseDown={onMouseDown}
        role="separator"
        aria-orientation={isHorizontal ? "vertical" : "horizontal"}
        tabIndex={0}
        className={
          isHorizontal
            ? `divider-handle w-1.5 ${dragging ? "dragging" : ""}`
            : `divider-handle-h h-1.5 ${dragging ? "dragging" : ""}`
        }
      />

      <div className="min-h-0 min-w-0 overflow-hidden flex-1">{second}</div>
    </div>
  );
}
