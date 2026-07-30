/**
 * DebugControls.jsx — Navigation bar for the SkyCompiler step debugger.
 *
 * Renders below the editor in place of the language selector when a debug
 * session is active. Shows:
 *   ⏮ First | ◀ Prev  |  Step N / Total  |  ▶ Next | ⏭ Last
 *   ───────────────── progress bar ──────────────────
 *   [exception banner if current step has an error]
 */

import { SkipBackIcon, ChevronLeftIcon, ChevronRightIcon, SkipForwardIcon, BugIcon, AlertCircleIcon } from "./Icons";

const NavBtn = ({ onClick, disabled, title, children }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    title={title}
    className="debug-nav-btn"
    aria-label={title}
  >
    {children}
  </button>
);

export default function DebugControls({
  currentIndex,
  totalSteps,
  isAtFirst,
  isAtLast,
  onFirst,
  onPrev,
  onNext,
  onLast,
  onGoTo,
  currentStep,
  truncated,
}) {
  const stepNumber = currentIndex + 1;
  const progress = totalSteps > 1 ? (currentIndex / (totalSteps - 1)) * 100 : 100;
  const hasException = !!currentStep?.exception;

  return (
    <div className="debug-controls-bar">
      {/* Top row: nav buttons + step counter */}
      <div className="debug-controls-row">
        {/* Bug icon badge */}
        <div className="debug-badge-icon">
          <BugIcon size={13} />
          <span>Debugger</span>
        </div>

        {/* Navigation */}
        <div className="debug-nav-group">
          <NavBtn onClick={onFirst} disabled={isAtFirst} title="First step (Home)">
            <SkipBackIcon size={13} />
          </NavBtn>
          <NavBtn onClick={onPrev} disabled={isAtFirst} title="Previous step (←)">
            <ChevronLeftIcon size={13} />
          </NavBtn>

          <div className="debug-step-counter">
            <span className="debug-step-num">{stepNumber}</span>
            <span className="debug-step-sep">/</span>
            <span className="debug-step-total">{totalSteps}</span>
          </div>

          <NavBtn onClick={onNext} disabled={isAtLast} title="Next step (→)">
            <ChevronRightIcon size={13} />
          </NavBtn>
          <NavBtn onClick={onLast} disabled={isAtLast} title="Last step (End)">
            <SkipForwardIcon size={13} />
          </NavBtn>
        </div>

        {/* Truncated warning */}
        {truncated && (
          <div className="debug-truncation-warning">
            Capped at 2000 steps
          </div>
        )}
      </div>

      {/* Progress bar */}
      <div className="debug-progress-track">
        <div
          className="debug-progress-fill"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Exception banner */}
      {hasException && (
        <div className="debug-exception-banner">
          <AlertCircleIcon size={12} />
          <span className="debug-exception-type">{currentStep.exception.type}:</span>
          <span className="debug-exception-msg">{currentStep.exception.message}</span>
        </div>
      )}
    </div>
  );
}
