import { useLanguage } from "../../../../localization/i18n.jsx";

export default function ArenaVisualFlashWindow({ battle }) {
  const { language } = useLanguage();
  if (!battle || !["flash1", "flash2"].includes(battle.stage)) return null;
  return (
    <div className={`arena-visual-flash-window is-${battle.stage}`}>
      <span>{language === "ja" ? (battle.stage === "flash1" ? "1回目のフラッシュ" : "2回目のフラッシュ") : (battle.stage === "flash1" ? "First Flash Timing" : "Second Flash Timing")}</span>
      <strong>{battle.viewerHasFlashPriority ? (language === "ja" ? "自分の優先権" : "Your Flash priority") : battle.priorityPlayerName || (language === "ja" ? "相手の優先権" : "Opponent priority")}</strong>
      <small>{language === "ja" ? "使用できるマジックやフラッシュ効果が表示されます。" : "Magic, High Speed and Field Flash actions are shown when legally available."}</small>
    </div>
  );
}
