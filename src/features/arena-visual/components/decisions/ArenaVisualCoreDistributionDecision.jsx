import { japaneseText as ___bsJa } from "../../../../localization/displayLanguage.js";
export default function ArenaVisualCoreDistributionDecision({
  decision,
  distribution,
  assigned,
  changeDistribution,
  resolve
}) {
  const required = Math.max(0, Number(decision.totalCores || 0));
  const ready = decision.exactTotal !== false ? assigned === required : assigned <= required;
  return (
    <div className="arena-visual-center-core-distribution">
      {(decision.candidates || []).map((candidate) => {
        const id = candidate.instanceId || candidate.id;
        const amount = Number(distribution[id] || 0);
        return (
          <div key={id}>
            <span><strong>{candidate.name || candidate.cardId}</strong><small>{candidate.cardId || ""}</small></span>
            <button type="button" disabled={amount <= 0} onClick={() => changeDistribution(id, -1)}>−</button>
            <b>{amount}</b>
            <button type="button" disabled={assigned >= required} onClick={() => changeDistribution(id, 1)}>+</button>
          </div>
        );
      })}
      <footer className="arena-visual-center-decision-footer">
        <span>{assigned}/{required}{___bsJa(" Cores • Source: ", " コア • 出典: ")}{decision.sourceCoreZone || ___bsJa("reserve", "リザーブ")}</span>
        <button type="button" disabled={!ready} onClick={() => resolve({ coreDistribution: distribution })}>{___bsJa("Confirm Cores", "コアを確定")}</button>
      </footer>
    </div>
  );
}
