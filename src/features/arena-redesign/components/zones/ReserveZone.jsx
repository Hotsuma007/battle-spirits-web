import { japaneseText as ___bsJa } from "../../../../localization/displayLanguage.js";
import CoreResourceZone from "../resources/CoreResourceZone.jsx";

export default function ReserveZone({
  side,
  playerId,
  reserve = 0,
  soulCore = false,
  interaction = null
}) {
  const interactive = side === "player" && Boolean(interaction?.canMoveCores);

  return (
    <CoreResourceZone
      label={___bsJa("Reserve", "リザーブ")}
      zone="reserve"
      regularCount={reserve}
      soulCore={soulCore}
      compact
      playerId={playerId}
      interactive={interactive}
      interaction={interaction}
      className={`is-${side}`}
    />
  );
}
