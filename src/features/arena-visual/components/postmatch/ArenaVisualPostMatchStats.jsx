import { japaneseText as ___bsJa, isJapaneseDisplay as ___bsJapanese } from "../../../../localization/displayLanguage.js";
import { formatMatchDuration } from "../../../../services/player/postMatchService.js";

export default function ArenaVisualPostMatchStats({ result = {} }) {
  const summary = result.summary || {};
  return (
    <section className="arena-visual-postmatch-stats" aria-label={___bsJa("Post match statistics", "試合後の統計")}>
      <article><span>{___bsJa("Result", "結果")}</span><strong>{result.reasonTitle || ___bsJa("Match Complete", "対戦終了")}</strong><small>{result.reasonText || ""}</small></article>
      <article><span>{___bsJa("Final Turn", "最終ターン")}</span><strong>{result.turnNumber || "-"}</strong><small>{summary.turns || result.turnNumber || 1}{___bsJa(" turns", " ターン")}</small></article>
      <article><span>{___bsJa("Duration", "対戦時間")}</span><strong>{formatMatchDuration(summary.durationSeconds || 0, result.language || "en")}</strong></article>
      <article><span>{___bsJa("Life Remaining", "残りライフ")}</span><strong>{summary.lifeRemaining ?? "—"}</strong></article>
      <article className="is-deck"><span>{___bsJa("Deck", "デッキ")}</span><strong>{summary.deck?.name || ___bsJa("Match Snapshot", "対戦時のデッキ")}</strong><small>{summary.deck?.cardIds?.length ? (___bsJapanese() ? `${summary.deck.cardIds.length}枚` : `${summary.deck.cardIds.length} cards`) : ___bsJa("No deck snapshot available", "デッキのスナップショットはありません")}</small></article>
    </section>
  );
}
