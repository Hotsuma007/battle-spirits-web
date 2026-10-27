import { japaneseText as ___bsJa } from "../../../../localization/displayLanguage.js";
import { useLanguage } from "../../../../localization/i18n.jsx";

export default function ArenaVisualFlashWindow({ battle }) {
  const { language } = useLanguage();
  if (!battle || !["flash1", "flash2"].includes(battle.stage)) return null;
  return (
    <div className={`arena-visual-flash-window is-${battle.stage}`}>
      <span>{language === "ja" ? (battle.stage === "flash1" ? "1回目のフラッシュ" : "2回目のフラッシュ") : (battle.stage === "flash1" ? ___bsJa("First Flash Timing", "最初のフラッシュのタイミング") : ___bsJa("Second Flash Timing", "2回目のフラッシュタイミング"))}</span>
      <strong>{battle.viewerHasFlashPriority ? (language === "ja" ? "自分の優先権" : ___bsJa("Your Flash priority", "Flash の優先順位")) : battle.priorityPlayerName || (language === "ja" ? "相手の優先権" : ___bsJa("Opponent priority", "相手優先"))}</strong>
      <small>{language === "ja" ? "使用できるマジックやフラッシュ効果が表示されます。" : ___bsJa("Magic, High Speed and Field Flash actions are shown when legally available.", "マジック、ハイスピード、フィールドフラッシュのアクションは、合法的に利用可能な場合に表示されます。")}</small>
    </div>
  );
}
