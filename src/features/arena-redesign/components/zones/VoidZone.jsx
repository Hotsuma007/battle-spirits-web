import { japaneseText as ___bsJa } from "../../../../localization/displayLanguage.js";
import ArenaZone from "./ArenaZone.jsx";

export default function VoidZone({ side }) {
  return (
    <ArenaZone zone="void" label={___bsJa("Void", "ボイド")} side={side} compact>
      <div className="arena-redesign-void-mark" aria-label={___bsJa("Void", "ボイド")}>∞</div>
    </ArenaZone>
  );
}
