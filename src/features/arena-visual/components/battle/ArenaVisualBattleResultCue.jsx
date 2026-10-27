import { japaneseText as ___bsJa } from "../../../../localization/displayLanguage.js";
import { useLanguage } from "../../../../localization/i18n.jsx";

export default function ArenaVisualBattleResultCue({ battle }) {
  const { language } = useLanguage();
  if (!battle || !["resolve", "end"].includes(battle.stage)) return null;
  return (
    <div className="arena-visual-battle-result-cue">
      <span>{language === "ja" ? "バトル解決" : ___bsJa("Battle Resolution", "バトルの解決")}</span>
      <strong>{battle.blocker ? `${battle.attacker?.name || (language === "ja" ? "アタック側" : "Attacker")} vs ${battle.blocker?.name || (language === "ja" ? "ブロック側" : "Blocker")}` : (language === "ja" ? "ライフへアタック" : ___bsJa("Direct Attack", "直接攻撃"))}</strong>
      <small>{language === "ja" ? "バトルを解決中です。" : battle.blocker ? ___bsJa("Battle comparison and destruction are resolved by the Rules Engine.", "バトルの比較と破壊はルール エンジンによって解決されます。") : ___bsJa("The attack remains direct unless another rule changes the result.", "別のルールによって結果が変わらない限り、攻撃は直接的なままです。")}</small>
    </div>
  );
}
