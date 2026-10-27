import { useLanguage } from "../../../../localization/i18n.jsx";

export default function ArenaVisualBattleResultCue({ battle }) {
  const { language } = useLanguage();
  if (!battle || !["resolve", "end"].includes(battle.stage)) return null;
  return (
    <div className="arena-visual-battle-result-cue">
      <span>{language === "ja" ? "バトル解決" : "Battle Resolution"}</span>
      <strong>{battle.blocker ? `${battle.attacker?.name || (language === "ja" ? "アタック側" : "Attacker")} vs ${battle.blocker?.name || (language === "ja" ? "ブロック側" : "Blocker")}` : (language === "ja" ? "ライフへアタック" : "Direct Attack")}</strong>
      <small>{language === "ja" ? "バトルを解決中です。" : battle.blocker ? "Battle comparison and destruction are resolved by the Rules Engine." : "The attack remains direct unless another rule changes the result."}</small>
    </div>
  );
}
