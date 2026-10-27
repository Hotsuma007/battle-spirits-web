import ArenaVisualBattleRestrictionHint from "./ArenaVisualBattleRestrictionHint.jsx";
import ArenaVisualBattleResultCue from "./ArenaVisualBattleResultCue.jsx";
import ArenaVisualFlashWindow from "./ArenaVisualFlashWindow.jsx";
import { useLanguage } from "../../../../localization/i18n.jsx";

function MiniCard({ card, role }) {
  const { language } = useLanguage();
  const roleLabel = language === "ja" ? (role === "attacker" ? "アタック" : "ブロック") : (role === "attacker" ? "Attacker" : "Blocker");
  if (!card) return (
    <div className={`arena-visual-battle-mini-card is-${role} is-empty`}>
      <span>{roleLabel}</span>
      <strong>{role === "blocker" ? (language === "ja" ? "ブロッカーなし" : "No Blocker") : "—"}</strong>
    </div>
  );
  return (
    <div className={`arena-visual-battle-mini-card is-${role}`} style={{ "--arena-visual-battle-accent": card.color || "#f3f3f3" }}>
      {card.image ? <img src={card.image} alt="" draggable="false" /> : null}
      <span>
        <small>{roleLabel}</small>
        <strong>{card.name || card.cardId || role}</strong>
        {Number.isFinite(card.bp) ? <b>{card.bp} BP</b> : null}
      </span>
    </div>
  );
}

export default function ArenaVisualBattleState({ battle }) {
  const { language } = useLanguage();
  if (!battle) return null;
  return (
    <section className={`arena-visual-battle-state is-${battle.stage || "active"}`}>
      <header>
        <span>{language === "ja" ? "バトル" : "Battle Timing"}</span>
        <strong>{language === "ja" ? ({ flash1: "1回目のフラッシュ", block: "ブロック", flash2: "2回目のフラッシュ", resolve: "バトル解決" }[battle.stage] || "バトル") : (battle.stageLabel || "Battle")}</strong>
        {battle.directAttack ? <b>{language === "ja" ? "ライフへアタック" : "Direct Attack"}</b> : null}
      </header>

      <div className="arena-visual-battle-pair">
        <MiniCard card={battle.attacker} role="attacker" />
        <i aria-hidden="true">→</i>
        <MiniCard card={battle.blocker} role="blocker" />
      </div>

      <ArenaVisualFlashWindow battle={battle} />
      <ArenaVisualBattleResultCue battle={battle} />
      <ArenaVisualBattleRestrictionHint battle={battle} />
    </section>
  );
}
