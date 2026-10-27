import { japaneseText as ___bsJa } from "../../../../localization/displayLanguage.js";
export default function FlashWindow({ flash, onActionRequest }) {
  if (!flash?.active) return null;

  const passAction = flash.actions.find((action) => action.type === "PASS_FLASH");
  const playableCount = flash.actions.filter((action) => action.type !== "PASS_FLASH").length;

  return (
    <section className="arena-redesign-effect-window arena-redesign-flash-window" aria-label={___bsJa("Flash Window", "フラッシュウィンドウ")}>
      <div>
        <span className="arena-redesign-effect-eyebrow">{flash.label || ___bsJa("Flash Timing", "フラッシュのタイミング")}</span>
        <strong>{flash.viewerHasPriority ? ___bsJa("Your priority", "あなたの優先事項") : ___bsJa("Waiting for priority", "優先待ち")}</strong>
        {flash.viewerHasPriority && <small>{playableCount}{___bsJa(" Flash action", " フラッシュアクション")}{playableCount === 1 ? "" : "s"}{___bsJa(" available", " 利用可能")}</small>}
      </div>
      {flash.viewerHasPriority && passAction && (
        <button type="button" onClick={() => onActionRequest?.(passAction, { source: "flash" })}>{___bsJa("Pass", "パス")}</button>
      )}
    </section>
  );
}
