import { useLanguage } from "../../../../localization/i18n.jsx";

const PHASES = [
  { id: "start", label: "Start" },
  { id: "core", label: "Core" },
  { id: "draw", label: "Draw" },
  { id: "refresh", label: "Refresh" },
  { id: "main", label: "Main" },
  { id: "attack", label: "Attack" },
  { id: "end", label: "End" }
];
const JA_PHASES = { start: "スタート", core: "コア", draw: "ドロー", refresh: "リフレッシュ", main: "メイン", attack: "アタック", end: "エンド" };

export default function ArenaVisualPhaseBar({ utility = {}, onAdvanceRequest }) {
  const { language } = useLanguage();
  const currentPhase = String(utility?.currentPhase || "start").toLowerCase();
  const currentIndex = Math.max(0, PHASES.findIndex((phase) => phase.id === currentPhase));
  const showAdvance = utility?.showAdvanceStep !== false;
  const canAdvance = utility?.canAdvanceStep !== false;
  const advanceLabel = utility?.advanceStepLabel || "Avançar";

  return (
    <section className="arena-visual-phase-bar" aria-label={language === "ja" ? "ターンの進行" : "Turn phase tracker"}>
      <div className="arena-visual-phase-bar-track" role="list">
        {PHASES.map((phase, index) => {
          const current = index === currentIndex;
          const complete = index < currentIndex;
          return (
            <div
              key={phase.id}
              className={`arena-visual-phase-bar-step${current ? " is-current" : ""}${complete ? " is-complete" : ""}`}
              role="listitem"
              aria-current={current ? "step" : undefined}
            >
              <i aria-hidden="true" />
              <span>{language === "ja" ? JA_PHASES[phase.id] : phase.label}</span>
            </div>
          );
        })}
      </div>

      {showAdvance ? (
        <button
          type="button"
          className="arena-visual-phase-bar-advance"
          disabled={!canAdvance}
          onClick={() => onAdvanceRequest?.(utility?.advanceStepAction || { id: "advance-phase", type: "ADVANCE_PHASE", label: advanceLabel })}
        >
          <span>{advanceLabel}</span>
          <b aria-hidden="true">›</b>
        </button>
      ) : null}
    </section>
  );
}
