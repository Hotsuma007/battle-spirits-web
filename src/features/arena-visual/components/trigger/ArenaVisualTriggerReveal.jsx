import { japaneseText as ___bsJa, isJapaneseDisplay as ___bsJapanese } from "../../../../localization/displayLanguage.js";
export default function ArenaVisualTriggerReveal({ trigger }) {
  const source = trigger?.source || {};
  const revealed = trigger?.revealed || {};
  return (
    <div className="arena-visual-trigger-reveal">
      <article>
        <span>{trigger?.kind === "xu" ? ___bsJa("XU Source", "XU ソース") : ___bsJa("Ultimate", "究極の")}</span>
        <div>{source.image ? <img src={source.image} alt={source.name || ""} /> : <b>{source.name || ___bsJa("Ultimate", "究極の")}</b>}</div>
        <strong>{source.name || ___bsJa("Ultimate", "究極の")}</strong>
        <small>{___bsJa("Cost ", "コスト ")}{trigger?.sourceCost ?? "—"}</small>
      </article>
      <div className="arena-visual-trigger-result-mark">
        <b>{trigger?.status === "emptyDeck" ? "—" : trigger?.originalHit ? ">" : "≤"}</b>
        <span>{trigger?.resultLabel || ___bsJa("GUARD", "ガード")}</span>
      </div>
      <article>
        <span>{___bsJa("Revealed", "明らかにした")}</span>
        <div>{revealed.image ? <img src={revealed.image} alt={revealed.name || ""} /> : <b>{revealed.name || ___bsJa("Empty Deck", "空のデッキ")}</b>}</div>
        <strong>{revealed.name || ___bsJa("Empty Deck", "空のデッキ")}</strong>
        <small>{trigger?.revealedCost == null ? "—" : (___bsJapanese() ? `コスト ${trigger.revealedCost}` : `Cost ${trigger.revealedCost}`)}</small>
      </article>
    </div>
  );
}
