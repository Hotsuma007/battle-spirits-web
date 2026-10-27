import { japaneseText as ___bsJa, isJapaneseDisplay as ___bsJapanese } from "../../../../localization/displayLanguage.js";
export default function TurnStatusPanel({ turn }) {
  if (!turn) return null;

  return (
    <section className="arena-redesign-utility-section arena-redesign-turn-status" aria-label={___bsJa("Turn status", "ターンステータス")}>
      <div className="arena-redesign-utility-heading">
        <span>{___bsJa("Turn", "ターン")}</span>
        <strong>{turn.number}</strong>
      </div>
      <div className="arena-redesign-turn-phase">{turn.phaseLabel}</div>
      <div className="arena-redesign-turn-owner">
        {turn.viewerIsActivePlayer ? ___bsJa("YOUR TURN", "あなたの番です") : (turn.activePlayerName ? (___bsJapanese() ? `${turn.activePlayerName}さんのターン` : `${turn.activePlayerName}'s turn`) : ___bsJa("Opponent turn", "相手のターン"))}
      </div>
      {turn.turnClock ? (
        <time className="arena-redesign-turn-clock">{String(turn.turnClock)}</time>
      ) : null}
    </section>
  );
}
