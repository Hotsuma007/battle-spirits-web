import { japaneseText as ___bsJa, isJapaneseDisplay as ___bsJapanese } from "../../../../localization/displayLanguage.js";
export default function ArenaVisualBraveAttachment({ brave }) {
  if (!brave) return null;
  return (
    <div className="arena-visual-brave-attachment" aria-label={(___bsJapanese() ? `付属ブレイヴ：${brave.name || "Brave"}` : `Attached Brave: ${brave.name || "Brave"}`)}>
      <img src={brave.image || "/images/card-back.webp"} alt={brave.name || ___bsJa("Brave", "ブレイヴ")} draggable="false" />
    </div>
  );
}
