import { japaneseText as ___bsJa } from "../../../../localization/displayLanguage.js";
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
      <span className="arena-visual-summon-payment-eyebrow">{ja ? "召喚・配置" : ___bsJa("Summon", "召喚")}</span>
      <strong>{pending.cardName || ___bsJa("Card", "カード")}</strong>

      <div className="arena-visual-summon-payment-grid">
        <div>
          <span>{ja ? "基本コスト" : ___bsJa("Printed cost", "印刷コスト")}</span>
          <strong>{pending.printedCost}</strong>
        </div>
        <div>
          <span>{ja ? "軽減" : ___bsJa("Reduction", "削減")}</span>
          <strong>-{pending.reductionApplied || 0}</strong>
        </div>
        <div className={costReady ? "is-ready" : ""}>
          <span>{ja ? "コストの支払い" : ___bsJa("Cost payment", "費用の支払い")}</span>
          <strong>{pending.paid} / {pending.payableCost}</strong>
        </div>
        <div className={coreReady ? "is-ready" : ""}>
          <span>{ja ? "カード上のコア" : ___bsJa("Minimum Cores", "最小コア数")}</span>
          <strong>{pending.currentCores} / {pending.minimumCores}</strong>
        </div>
      </div>

      <p>
        {ja ? "リザーブのコアを選んでコストを支払い、その後カードに必要なコアを置いてください。" : ___bsJa("Click Reserve Cores to pay. After the cost is complete, place the minimum Cores required on the card.", "「コアをリザーブ」をクリックして支払います。コストが完了したら、必要最小限のコアをカードに配置します。")}
      </p>

      <small className="arena-visual-summon-payment-note">{ja ? "画面中央の操作で確定または取り消しができます。" : ___bsJa("Confirm / Cancel actions are shown in the center action prompt.", "アクションの確認/キャンセルは、中央のアクション プロンプトに表示されます。")}</small>
    </aside>
  );
}
