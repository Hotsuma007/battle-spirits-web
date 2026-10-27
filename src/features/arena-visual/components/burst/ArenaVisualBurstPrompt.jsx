import { japaneseText as ___bsJa } from "../../../../localization/displayLanguage.js";
export default function ArenaVisualBurstPrompt({ burst }) {
  if (!burst) return null;
  return (
    <section className={`arena-visual-burst-prompt${burst.waiting ? " is-waiting" : ""}`}>
      <header>
        <span>{___bsJa("Burst Opportunity", "バーストチャンス")}</span>
        <strong>{burst.waiting ? ___bsJa("Opponent decision", "相手の決定") : ___bsJa("Activation window detected", "アクティベーションウィンドウが検出されました")}</strong>
      </header>
      {!burst.hidden && burst.card ? (
        <div>
          {burst.card.image ? <img src={burst.card.image} alt="" draggable="false" /> : null}
          <span><strong>{burst.card.name || ___bsJa("Burst", "バースト")}</strong><small>{burst.cause || ___bsJa("Burst condition", "バースト状態")}</small></span>
        </div>
      ) : (
        <p>{burst.waiting ? ___bsJa("Waiting for the opponent to activate or pass Burst.", "相手がバーストを発動するかパスするのを待ちます。") : ___bsJa("Choose whether to activate the set Burst.", "セットしたバーストを発動するかどうかを選択します。")}</p>
      )}
    </section>
  );
}
