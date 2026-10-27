import { japaneseText as ___bsJa } from "../../../../localization/displayLanguage.js";
import ArenaZone from "./ArenaZone.jsx";
import CorePool from "../resources/CorePool.jsx";

export default function LifeZone({ side, playerId, life = 0, soulCore = false }) {
  return (
    <ArenaZone zone="life" label={___bsJa("Life", "ライフ")} side={side} count={life} compact>
      <CorePool
        regularCount={life}
        soulCore={soulCore}
        compact
        maxVisible={6}
        label={___bsJa("Life", "ライフ")}
        playerId={playerId}
        zone="life"
        interactive={false}
      />
    </ArenaZone>
  );
}
