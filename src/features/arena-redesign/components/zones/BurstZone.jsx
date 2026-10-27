import { japaneseText as ___bsJa } from "../../../../localization/displayLanguage.js";
import ArenaZone from "./ArenaZone.jsx";

export default function BurstZone({ side, card }) {
  const occupied = Boolean(card);

  return (
    <ArenaZone zone="burst" label={___bsJa("Burst", "バースト")} side={side} compact>
      <div
        className="arena-redesign-burst-slot"
        data-occupied={occupied ? "true" : "false"}
        data-hidden-card={card?.hidden ? "true" : "false"}
      >
        {occupied ? (
          <span className="arena-redesign-burst-card" aria-hidden="true">
            {card?.hidden ? ___bsJa("Set", "収録弾") : card?.cardId || ___bsJa("Set", "収録弾")}
          </span>
        ) : null}
      </div>
    </ArenaZone>
  );
}
