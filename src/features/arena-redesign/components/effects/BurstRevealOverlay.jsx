import { japaneseText as ___bsJa, isJapaneseDisplay as ___bsJapanese } from "../../../../localization/displayLanguage.js";
export default function BurstRevealOverlay({ burst, onActionRequest }) {
  if (!burst?.active) return null;

  return (
    <section className="arena-redesign-effect-window arena-redesign-burst-window" aria-label={___bsJa("Burst Window", "バーストウィンドウ")}>
      <div>
        <span className="arena-redesign-effect-eyebrow">{___bsJa("Burst Window", "バーストウィンドウ")}</span>
        <strong>{burst.viewerOwnsWindow ? ___bsJa("Your Burst opportunity", "バーストのチャンス") : ___bsJa("Opponent Burst opportunity", "相手バーストチャンス")}</strong>
        <small>{burst.event || ___bsJa("Burst condition", "バースト状態")}{burst.amount > 0 ? (___bsJapanese() ? `・${burst.amount}ライフ` : ` · ${burst.amount} Life`) : ""}</small>
      </div>
      {burst.viewerOwnsWindow && burst.actions.length > 0 && (
        <div className="arena-redesign-effect-actions">
          {burst.actions.map((action) => (
            <button key={action.id || action.type} type="button" onClick={() => onActionRequest?.(action, { source: "burst" })}>
              {action.type === "ACTIVATE_BURST" ? ___bsJa("Activate Burst", "バーストを発動する") : action.type === "PASS_BURST" ? ___bsJa("Pass Burst", "パスバースト") : action.label}
            </button>
          ))}
        </div>
      )}
    </section>
  );
}
