import { japaneseText as ___bsJa } from "../../../../localization/displayLanguage.js";
import { formatMatchDuration } from "../../../../services/player/postMatchService.js";

export default function ArenaVisualMatchResultSummary({ result = {} }) {
  const summary = result.summary || {};
  return (
    <div className="arena-visual-result-summary">
      <article><span>{___bsJa("Result", "結果")}</span><strong>{result.reasonTitle || ___bsJa("Match Complete", "対戦終了")}</strong><small>{result.reasonText || ""}</small></article>
      <article><span>{___bsJa("Final Turn", "最終ターン")}</span><strong>{result.turnNumber || "-"}</strong></article>
      <article><span>{___bsJa("Duration", "対戦時間")}</span><strong>{formatMatchDuration(summary.durationSeconds || 0, result.language || "en")}</strong><small>{summary.turns || result.turnNumber || 1}{___bsJa(" turns", " ターン")}</small></article>
      <article><span>{___bsJa("Life Remaining", "残りライフ")}</span><strong>{summary.lifeRemaining ?? "—"}</strong></article>
      <article><span>{___bsJa("Card Mastery", "カードマスタリー")}</span><strong>+{summary.mastery?.totalXp || 0}{___bsJa(" XP", " 経験値")}</strong><small>{summary.mastery?.trackedCards || 0}{___bsJa(" cards progressed", " カードが進んだ")}</small></article>
      {summary.ranked ? <article><span>{___bsJa("Ranked", "ランク戦")}</span><strong>{summary.ranked.rpDelta >= 0 ? "+" : ""}{summary.ranked.rpDelta} RP</strong><small>{summary.ranked.rpBefore} → {summary.ranked.rpAfter} RP</small></article> : null}
    </div>
  );
}
