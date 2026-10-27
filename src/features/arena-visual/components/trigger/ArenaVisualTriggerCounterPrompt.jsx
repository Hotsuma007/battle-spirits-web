import { japaneseText as ___bsJa } from "../../../../localization/displayLanguage.js";
export default function ArenaVisualTriggerCounterPrompt({ trigger, onActionRequest }) {
  if (!trigger || trigger.status !== "counterWindow") return null;

  if (trigger.waiting) {
    return <div className="arena-visual-trigger-waiting">{___bsJa("Waiting for the opponent's Trigger Counter response.", "相手のトリガーカウンターの反応を待ちます。")}</div>;
  }

  return (
    <section className="arena-visual-trigger-counter">
      <header><span>{___bsJa("Trigger Counter", "トリガーカウンター")}</span><strong>{___bsJa("Respond before the HIT effect resolves", "ヒット効果の解決前に対応")}</strong></header>
      <p>{___bsJa("Use a valid Trigger Counter Magic now, or pass this response window.", "今すぐ有効なトリガーカウンターマジックを使用するか、この応答ウィンドウを渡してください。")}</p>
      <div>
        {(trigger.counterCards || []).map((card) => (
          <button
            type="button"
            key={card.instanceId}
            className="arena-visual-trigger-counter-card"
            onClick={() => onActionRequest?.({
              id: `trigger-counter-${card.instanceId}`,
              type: "USE_TRIGGER_COUNTER",
              instanceId: card.instanceId,
              actorId: trigger.counterPlayerId
            })}
          >
            {card.image ? <img src={card.image} alt="" /> : null}
            <span><strong>{card.name}</strong><small>{___bsJa("Cost ", "コスト ")}{card.cost ?? "—"}</small></span>
          </button>
        ))}
        <button
          type="button"
          className="is-quiet"
          onClick={() => onActionRequest?.({ id: "pass-trigger-counter", type: "PASS_TRIGGER_COUNTER", actorId: trigger.counterPlayerId })}
        >{___bsJa("Do Not Use Trigger Counter", "トリガーカウンターを使用しないでください")}</button>
      </div>
    </section>
  );
}
