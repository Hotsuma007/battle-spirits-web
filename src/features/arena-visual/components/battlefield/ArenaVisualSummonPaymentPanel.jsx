import { useLanguage } from "../../../../localization/i18n.jsx";

export default function ArenaVisualSummonPaymentPanel({ pending }) {
  const { language } = useLanguage();
  const ja = language === "ja";
  if (!pending || pending.kind !== "play") return null;

  const costReady = Number(pending.paid || 0) === Number(pending.payableCost || 0);
  const coreReady = Number(pending.currentCores || 0) >= Number(pending.minimumCores || 0);
  const ready = costReady && coreReady;

  return (
    <aside className="arena-visual-summon-payment" aria-live="polite">
      <span className="arena-visual-summon-payment-eyebrow">{ja ? "召喚・配置" : "Summon"}</span>
      <strong>{pending.cardName || "Card"}</strong>

      <div className="arena-visual-summon-payment-grid">
        <div>
          <span>{ja ? "基本コスト" : "Printed cost"}</span>
          <strong>{pending.printedCost}</strong>
        </div>
        <div>
          <span>{ja ? "軽減" : "Reduction"}</span>
          <strong>-{pending.reductionApplied || 0}</strong>
        </div>
        <div className={costReady ? "is-ready" : ""}>
          <span>{ja ? "コストの支払い" : "Cost payment"}</span>
          <strong>{pending.paid} / {pending.payableCost}</strong>
        </div>
        <div className={coreReady ? "is-ready" : ""}>
          <span>{ja ? "カード上のコア" : "Minimum Cores"}</span>
          <strong>{pending.currentCores} / {pending.minimumCores}</strong>
        </div>
      </div>

      <p>
        {ja ? "リザーブのコアを選んでコストを支払い、その後カードに必要なコアを置いてください。" : "Click Reserve Cores to pay. After the cost is complete, place the minimum Cores required on the card."}
      </p>

      <small className="arena-visual-summon-payment-note">{ja ? "画面中央の操作で確定または取り消しができます。" : "Confirm / Cancel actions are shown in the center action prompt."}</small>
    </aside>
  );
}
