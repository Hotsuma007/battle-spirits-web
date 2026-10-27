import { useLanguage } from "../../../../localization/i18n.jsx";

export default function ArenaVisualMulliganPrompt({ setup, onActionRequest }) {
  const { language } = useLanguage();
  const ja = language === "ja";
  if (!setup?.openingSetup) return null;

  return (
    <section className="arena-visual-mulligan-prompt" aria-live="polite">
      <header>
        <span>{ja ? "対戦開始" : "Opening Setup"}</span>
        <strong>{setup.firstPlayerName ? (ja ? `${setup.firstPlayerName}が先攻` : `${setup.firstPlayerName} goes first`) : (ja ? "対戦開始" : "Match opening")}</strong>
      </header>
      <div className="arena-visual-mulligan-summary">
        <article><span>{ja ? "手札" : "Hand"}</span><strong>{setup.handCount}</strong></article>
        <article><span>{ja ? "ライフ" : "Life"}</span><strong>{setup.life}</strong></article>
        <article><span>{ja ? "リザーブ" : "Reserve"}</span><strong>{setup.reserve}</strong></article>
        <article><span>{ja ? "ソウルコア" : "Soul Core"}</span><strong>{setup.soulCoreZone === "reserve" ? (ja ? "リザーブ" : "Reserve") : setup.soulCoreZone || "—"}</strong></article>
      </div>
      <p>{setup.mulliganAvailable
        ? (ja ? "スタートステップに進む前に、手札を1回引き直せます。" : "You may redraw your opening hand once before advancing the Start Step.")
        : setup.mulliganUsed
          ? (ja ? "引き直しは使用済みです。" : "Mulligan already used. Continue with this opening hand.")
          : (ja ? "この対戦では引き直せません。" : "Mulligan is unavailable for this match.")}</p>
      {setup.mulliganAvailable ? (
        <button type="button" onClick={() => onActionRequest?.({ id: "mulligan", type: "MULLIGAN" })}>
          {ja ? "手札を引き直す" : "Mulligan"}
        </button>
      ) : null}
    </section>
  );
}
