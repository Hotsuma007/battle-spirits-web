import { japaneseText as ___bsJa } from "../../../localization/displayLanguage.js";
import { memo } from "react";

const PHASES = [
  { id: "start", label: "Start" },
  { id: "core", label: "Core" },
  { id: "draw", label: "Draw" },
  { id: "refresh", label: "Refresh" },
  { id: "main", label: "Main" },
  { id: "attack", label: "Attack" },
  { id: "end", label: "End" }
];

function PhaseTrackerComponent({
  currentPhase,
  activePlayerName = "",
  turnNumber = 1,
  canAdvance = false,
  showAdvance = true,
  onAdvance,
  language = "ptBR",
  className = ""
}) {
  const currentIndex = Math.max(0, PHASES.findIndex((phase) => phase.id === currentPhase));

  return (
    <section
      className={`arena-phase-tracker ${className}`.trim()}
      data-current-phase={currentPhase || "start"}
      aria-label={___bsJa("Turn phase tracker", "ターンフェーズトラッカー")}
    >
      <div className="arena-phase-tracker-meta">
        <span>{language === "en" ? ___bsJa("TURN", "振り向く") : ___bsJa("TURNO", "振り向く")} {turnNumber}</span>
        {activePlayerName ? <strong>{activePlayerName}</strong> : null}
      </div>

      <div className="arena-phase-track" role="list">
        {PHASES.map((phase, index) => {
          const current = phase.id === currentPhase;
          const complete = index < currentIndex;

          return (
            <div
              key={phase.id}
              className={`arena-phase-item ${current ? "is-current" : ""} ${complete ? "is-complete" : ""}`.trim()}
              role="listitem"
              aria-current={current ? "step" : undefined}
            >
              <span className="arena-phase-dot" />
              <span className="arena-phase-label">{phase.label}</span>
            </div>
          );
        })}
      </div>

      {showAdvance ? (
        <button
          type="button"
          className="arena-phase-advance"
          disabled={!canAdvance}
          onClick={onAdvance}
        >
          <span>{language === "en" ? ___bsJa("Next", "次") : ___bsJa("Avançar", "次")}</span>
          <b aria-hidden="true">›</b>
        </button>
      ) : null}
    </section>
  );
}

export default memo(PhaseTrackerComponent);
