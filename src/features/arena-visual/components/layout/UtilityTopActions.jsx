import { japaneseText as ___bsJa, isJapaneseDisplay as ___bsJapanese } from "../../../../localization/displayLanguage.js";
export default function UtilityTopActions() {
  return (
    <div className="arena-visual-utility-actions is-top" aria-label={___bsJa("Top utility action slots", "トップユーティリティアクションスロット")}>
      {Array.from({ length: 4 }, (_, index) => (
        <button
          key={index}
          type="button"
          className="arena-visual-utility-action"
          aria-label={(___bsJapanese() ? `トップユーティリティスロット ${index + 1}` : `Top utility slot ${index + 1}`)}
          tabIndex={-1}
        />
      ))}
    </div>
  );
}
