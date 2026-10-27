import { japaneseText as ___bsJa, isJapaneseDisplay as ___bsJapanese } from "../../../localization/displayLanguage.js";
/**
 * Visual summary for manual Battle Spirits payments.
 *
 * This component never changes game state. It only translates the values
 * already calculated by the Rules Engine into a compact, readable payment UI.
 */
export default function PaymentStatus({
  printedCost = 0,
  reduction = 0,
  finalCost = 0,
  paid = 0,
  minimumCores = null,
  currentCores = null,
  language = "ptBR",
  mode = "summon"
}) {
  const pt = language !== "en";
  const costTarget = Math.max(0, Number(finalCost || 0));
  const paidValue = Math.max(0, Number(paid || 0));
  const paidPercent = costTarget === 0 ? 100 : Math.min(100, (paidValue / costTarget) * 100);
  const costComplete = paidValue === costTarget;

  const minTarget = minimumCores == null ? null : Math.max(0, Number(minimumCores || 0));
  const currentValue = currentCores == null ? null : Math.max(0, Number(currentCores || 0));
  const levelComplete = minTarget == null || currentValue >= minTarget;
  const levelPercent = minTarget === null || minTarget === 0
    ? 100
    : Math.min(100, (currentValue / minTarget) * 100);

  const remaining = Math.max(0, costTarget - paidValue);

  return (
    <div className={`payment-status ${costComplete && levelComplete ? "is-complete" : ""}`}>
      <div className="payment-cost-equation" aria-label={pt ? ___bsJa("Resumo do custo", "コストの概要") : ___bsJa("Cost summary", "コストの概要")}>
        <span>
          <small>{pt ? ___bsJa("Custo base", "基本コスト") : ___bsJa("Base cost", "基本コスト")}</small>
          <b>{Number(printedCost || 0)}</b>
        </span>
        <i>−</i>
        <span className="reduction">
          <small>{pt ? ___bsJa("Redução", "削減") : ___bsJa("Reduction", "削減")}</small>
          <b>{Number(reduction || 0)}</b>
        </span>
        <i>=</i>
        <span className="final">
          <small>{pt ? ___bsJa("Custo final", "最終コスト") : ___bsJa("Final cost", "最終コスト")}</small>
          <b>{costTarget}</b>
        </span>
      </div>

      <div className={`payment-progress-row ${costComplete ? "complete" : ""}`}>
        <div className="payment-progress-copy">
          <span>{mode === "summon" ? (pt ? ___bsJa("Custo de invocação", "召喚コスト") : ___bsJa("Summon cost", "召喚コスト")) : (pt ? ___bsJa("Custo para usar", "使用コスト") : ___bsJa("Cost to use", "使用コスト"))}</span>
          <b>{paidValue}/{costTarget}</b>
        </div>
        <div className="payment-progress-track" aria-hidden="true">
          <i style={{ width: `${paidPercent}%` }} />
        </div>
        <small>
          {costComplete
            ? (pt ? ___bsJa("Pagamento concluído", "支払い完了") : ___bsJa("Payment complete", "支払い完了"))
            : (pt ? (___bsJapanese() ? `${remaining} コア ${remaining === 1 ? "" : "s"} がありません` : `Faltam ${remaining} Core${remaining === 1 ? "" : "s"}`) : (___bsJapanese() ? `${remaining} コア${remaining === 1 ? "" : "s"} 残り` : `${remaining} Core${remaining === 1 ? "" : "s"} remaining`))}
        </small>
      </div>

      {minTarget !== null && currentValue !== null && (
        <div className={`payment-progress-row level ${levelComplete ? "complete" : ""}`}>
          <div className="payment-progress-copy">
            <span>{pt ? ___bsJa("Cores mínimo", "最小コア数") : ___bsJa("Minimum Cores", "最小コア数")}</span>
            <b>{currentValue}/{minTarget}</b>
          </div>
          <div className="payment-progress-track" aria-hidden="true">
            <i style={{ width: `${levelPercent}%` }} />
          </div>
          <small>
            {levelComplete
              ? (pt ? ___bsJa("LV mínimo garantido", "最低LV確保") : ___bsJa("Minimum LV secured", "最低LV確保"))
              : (pt ? ___bsJa("Coloque Cores na carta antes de confirmar", "確認する前にカードにコアを配置してください") : ___bsJa("Place Cores on the card before confirming", "確認する前にカードにコアを配置してください"))}
          </small>
        </div>
      )}
    </div>
  );
}
