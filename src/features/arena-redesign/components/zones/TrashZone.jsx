import { japaneseText as ___bsJa } from "../../../../localization/displayLanguage.js";
import ArenaZone from "./ArenaZone.jsx";

export default function TrashZone({ side, cards = [], count = 0 }) {
  const topCard = Array.isArray(cards) && cards.length ? cards[cards.length - 1] : null;

  return (
    <ArenaZone zone="trash" label={___bsJa("Trash", "トラッシュ")} side={side} count={count} compact>
      <div className="arena-redesign-zone-card-preview" data-has-card={topCard ? "true" : "false"}>
        {topCard ? (
          <span className="arena-redesign-card-reference" title={topCard.cardId || ___bsJa("Trash card", "トラッシュカード")}>
            {topCard.cardId || ___bsJa("Card", "カード")}
          </span>
        ) : (
          <span className="arena-redesign-empty-zone-mark" aria-hidden="true">—</span>
        )}
      </div>
    </ArenaZone>
  );
}
