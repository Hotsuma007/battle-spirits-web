import { japaneseText as ___bsJa } from "../../../../localization/displayLanguage.js";
export default function TargetMarker({ selected = false }) {
  return (
    <span
      className={`arena-redesign-target-marker${selected ? " is-selected" : ""}`}
      aria-hidden="true"
    >
      {selected ? ___bsJa("Selected", "選択済み") : ___bsJa("Target", "ターゲット")}
    </span>
  );
}
