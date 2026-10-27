import { japaneseText as ___bsJa } from "../../../../localization/displayLanguage.js";
import { useEffect, useRef } from "react";
import ArenaVisualDecisionHost from "../decisions/ArenaVisualDecisionHost.jsx";
import ArenaVisualUltimateTriggerPrompt from "../trigger/ArenaVisualUltimateTriggerPrompt.jsx";
import ArenaVisualBattleState from "../battle/ArenaVisualBattleState.jsx";
import ArenaVisualBurstPrompt from "../burst/ArenaVisualBurstPrompt.jsx";
import ArenaVisualMulliganPrompt from "../setup/ArenaVisualMulliganPrompt.jsx";
import { useLanguage } from "../../../../localization/i18n.jsx";

const JA_ACTIONS = {
  ACTIVATE_BURST: "バーストを発動", PASS_BURST: "パス", CONFIRM_MANUAL_PLAY: "確定",
  CANCEL_MANUAL_PLAY: "取り消す", CONFIRM_MANUAL_COST: "確定", CANCEL_MANUAL_COST: "取り消す",
  PASS_FLASH: "フラッシュをパス", DECLINE_BLOCK: "ブロックしない", PLAY_HAND_CARD: "カードを使用",
  DECLARE_ATTACK: "アタック", DECLARE_BLOCK: "ブロック",
  BEGIN_MAGIC_COST: "マジックを使用", USE_HIGH_SPEED: "神速を使用", SET_BURST_CARD: "バーストをセット",
  BEGIN_MIRAGE_COST: "ミラージュをセット", ACTIVATE_FIELD_FLASH: "フラッシュ効果を使用",
  SEPARATE_BRAVE: "合体を解除"
};

export default function ArenaVisualActionCenter({ utility = {}, onActionRequest }) {
  const { language } = useLanguage();
  const rawActions = Array.isArray(utility?.actions) ? utility.actions.slice(0, 8) : [];
  const decision = utility?.effectDecision || null;
  const ultimateTrigger = utility?.ultimateTrigger || null;
  const autoResolvedRef = useRef(null);
  const resolveAction = rawActions.find((action) => action?.type === "RESOLVE_BATTLE") || null;
  const actions = rawActions.filter((action) => action?.type !== "RESOLVE_BATTLE");

  useEffect(() => {
    if (!resolveAction || decision || ultimateTrigger) {
      if (!resolveAction) autoResolvedRef.current = null;
      return;
    }
    const key = `${utility?.battle?.attackerInstanceId || "battle"}:${utility?.battle?.stage || "resolve"}`;
    if (autoResolvedRef.current === key) return;
    autoResolvedRef.current = key;
    onActionRequest?.(resolveAction);
  }, [resolveAction, decision, ultimateTrigger, onActionRequest, utility?.battle?.attackerInstanceId, utility?.battle?.stage]);

  if (!decision && !ultimateTrigger && !actions.length && !utility?.battle && !utility?.burstOpportunity && !utility?.setup) return null;

  return (
    <div className="arena-visual-action-center" aria-label={language === "ja" ? "対戦操作" : ___bsJa("Arena action prompt", "アリーナアクションプロンプト")}>
      {decision ? <ArenaVisualDecisionHost decision={decision} onActionRequest={onActionRequest} /> : null}
      {!decision && ultimateTrigger ? <ArenaVisualUltimateTriggerPrompt trigger={ultimateTrigger} onActionRequest={onActionRequest} /> : null}
      {!decision && !ultimateTrigger && utility?.setup ? <ArenaVisualMulliganPrompt setup={utility.setup} onActionRequest={onActionRequest} /> : null}
      {!decision && !ultimateTrigger && !utility?.setup && utility?.burstOpportunity ? <ArenaVisualBurstPrompt burst={utility.burstOpportunity} /> : null}
      {!decision && !ultimateTrigger && !utility?.setup && !utility?.burstOpportunity && utility?.battle ? <ArenaVisualBattleState battle={utility.battle} /> : null}
      {!decision && !ultimateTrigger && actions.length ? (
        <section className="arena-visual-center-prompt" aria-live="polite">
          <span className="arena-visual-center-prompt-label">
            {language === "ja" ? (utility?.battle?.flashPriorityPlayerId ? "フラッシュタイミング" : utility?.battle ? "バトル" : "操作を選択") : utility?.battle?.flashPriorityPlayerId ? ___bsJa("Flash Timing", "フラッシュのタイミング") : utility?.battle ? ___bsJa("Battle Action", "バトルアクション") : ___bsJa("Action Required", "必要なアクション")}
          </span>
          <div className="arena-visual-center-action-buttons">
            {actions.map((action) => (
              <button
                key={action.id || action.label}
                type="button"
                className={`${action.emphasis ? "is-primary" : ""}${action.tone === "quiet" ? " is-quiet" : ""}${["BEGIN_MAGIC_COST","USE_HIGH_SPEED","ACTIVATE_FIELD_FLASH"].includes(action.type) && utility?.battle?.flashPriorityPlayerId ? " is-use-flash" : ""}${action.type === "PASS_FLASH" ? " is-pass-flash" : ""}${action.type === "DECLINE_BLOCK" ? " is-decline-block" : ""}`.trim()}
                disabled={action.disabled === true}
                onClick={() => onActionRequest?.(action)}
              >
                {language === "ja" ? (JA_ACTIONS[action.type] || action.label || action.id) : (action.label || action.id)}
              </button>
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
