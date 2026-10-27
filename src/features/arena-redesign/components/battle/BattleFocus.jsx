import { getDisplayCardName } from "../../../../localization/displayCardName.js";
import { japaneseText as ___bsJa } from "../../../../localization/displayLanguage.js";
import { getCardById } from "../../../../services/cards/cardRepository.js";
import { createBattleInteractionPresentation } from "../../models/battleInteractionPresentation.js";
import AttackConnector from "./AttackConnector.jsx";
import BattleStatus from "./BattleStatus.jsx";

function cardLabel(entry, fallback) {
  const cardId = entry?.physical?.cardId || null;
  const card = cardId ? getCardById(cardId) : null;
  return card ? getDisplayCardName(card) : cardId || fallback;
}

function Fighter({ entry, role, fallback }) {
  return (
    <div className={`arena-redesign-battle-fighter is-${role}`}>
      <span>{role === "attacker" ? ___bsJa("Attacker", "アタッカー") : ___bsJa("Blocker", "ブロッカー")}</span>
      <strong>{cardLabel(entry, fallback)}</strong>
    </div>
  );
}

export default function BattleFocus({ viewModel }) {
  const battle = createBattleInteractionPresentation(viewModel);
  if (!battle) return null;

  return (
    <section className="arena-redesign-battle-focus" data-battle-stage={battle.stage || undefined}>
      <BattleStatus battle={battle} />
      <div className="arena-redesign-battle-focus-line">
        <Fighter entry={battle.attacker} role="attacker" fallback="Attacker" />
        <div className="arena-redesign-battle-connection">
          <AttackConnector blocked={!battle.directAttack} />
          <small>{battle.directAttack ? ___bsJa("Life", "ライフ") : ___bsJa("Block", "ブロック")}</small>
        </div>
        {battle.directAttack ? (
          <div className="arena-redesign-battle-life-target">
            <span>{___bsJa("Defender", "ディフェンダー")}</span>
            <strong>{___bsJa("Life", "ライフ")}</strong>
          </div>
        ) : (
          <Fighter entry={battle.blocker} role="blocker" fallback="Blocker" />
        )}
      </div>
    </section>
  );
}
