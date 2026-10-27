import { japaneseText as ___bsJa } from "../../../../localization/displayLanguage.js";
export default function ArenaVisualPostMatchProgression({ result = {} }) {
  const summary = result.summary || {};
  const mastery = summary.mastery || {};
  const ranked = summary.ranked || null;

  if (!mastery.trackedCards && !ranked && !result.featuredMasteryImage) return null;

  return (
    <section className="arena-visual-postmatch-progression" aria-label={___bsJa("Post match progression", "試合後の進行")}>
      <header><span>{___bsJa("Progression", "進行状況")}</span><strong>{___bsJa("Match Rewards", "マッチ報酬")}</strong></header>
      <div>
        <article className="is-mastery">
          {result.featuredMasteryImage ? <img src={result.featuredMasteryImage} alt={result.featuredMasteryName || ""} /> : null}
          <span>
            <small>{___bsJa("Card Mastery", "カードマスタリー")}</small>
            <strong>+{mastery.totalXp || 0}{___bsJa(" XP", " 経験値")}</strong>
            <em>{mastery.trackedCards || 0}{___bsJa(" cards progressed", " カードが進んだ")}{result.featuredMasteryName ? ` • ${result.featuredMasteryName}` : ""}</em>
          </span>
        </article>
        {ranked ? (
          <article className={`is-ranked ${Number(ranked.rpDelta || 0) >= 0 ? "is-positive" : "is-negative"}`}>
            <span><small>{___bsJa("Ranked", "ランク戦")}</small><strong>{Number(ranked.rpDelta || 0) >= 0 ? "+" : ""}{ranked.rpDelta || 0} RP</strong><em>{ranked.rpBefore || 0} → {ranked.rpAfter || 0} RP{ranked.rank ? ` • ${ranked.rank}` : ""}</em></span>
          </article>
        ) : null}
      </div>
    </section>
  );
}
