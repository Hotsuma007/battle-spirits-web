import { japaneseText as ___bsJa, isJapaneseDisplay as ___bsJapanese } from "../../../../localization/displayLanguage.js";
export default function UtilityBottomActions() {
  return (
    <div className="arena-visual-utility-actions is-bottom" aria-label={___bsJa("Bottom utility action slots", "下部ユーティリティアクションスロット")}>
      {Array.from({ length: 4 }, (_, index) => (
        <button
          key={index}
          type="button"
          className="arena-visual-utility-action"
          aria-label={(___bsJapanese() ? `下部ユーティリティスロット ${index + 1}` : `Bottom utility slot ${index + 1}`)}
          tabIndex={-1}
        />
      ))}
    </div>
  );
}
