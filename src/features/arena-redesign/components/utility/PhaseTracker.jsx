import { japaneseText as ___bsJa } from "../../../../localization/displayLanguage.js";
export default function PhaseTracker({ phases = [] }) {
  return (
    <section className="arena-redesign-utility-section" aria-label={___bsJa("Phase tracker", "位相トラッカー")}>
      <header className="arena-redesign-utility-title">{___bsJa("Phase Tracker", "フェーズトラッカー")}</header>
      <ol className="arena-redesign-phase-tracker">
        {phases.map((phase) => (
          <li
            key={phase.id}
            className={`is-${phase.state}`}
            aria-current={phase.state === "current" ? "step" : undefined}
          >
            <span className="arena-redesign-phase-dot" aria-hidden="true" />
            <span>{phase.label}</span>
          </li>
        ))}
      </ol>
    </section>
  );
}
