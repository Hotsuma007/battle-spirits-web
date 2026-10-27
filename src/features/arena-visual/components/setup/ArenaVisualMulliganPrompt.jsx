import { japaneseText as ___bsJa, isJapaneseDisplay as ___bsJapanese } from "../../../../localization/displayLanguage.js";
import { useLanguage } from "../../../../localization/i18n.jsx";

export default function ArenaVisualMulliganPrompt({ setup, onActionRequest }) {
  const { language } = useLanguage();
  const ja = language === "ja";
  if (!setup?.openingSetup) return null;

  return (
    <section className="arena-visual-mulligan-prompt" aria-live="polite">
      <header>
        <span>{ja ? "対戦開始" : ___bsJa("Opening Setup", "セットアップを開く")}</span>
        <strong>{setup.firstPlayerName ? (ja ? `${setup.firstPlayerName}が先攻` : (___bsJapanese() ? `${setup.firstPlayerName} が最初になります` : `${setup.firstPlayerName} goes first`)) : (ja ? "対戦開始" : ___bsJa("Match opening", "試合開始"))}</strong>
      </header>
      <div className="arena-visual-mulligan-summary">
        <article><span>{ja ? "手札" : ___bsJa("Hand", "手札")}</span><strong>{setup.handCount}</strong></article>
        <article><span>{ja ? "ライフ" : ___bsJa("Life", "ライフ")}</span><strong>{setup.life}</strong></article>
        <article><span>{ja ? "リザーブ" : ___bsJa("Reserve", "リザーブ")}</span><strong>{setup.reserve}</strong></article>
        <article><span>{ja ? "ソウルコア" : ___bsJa("Soul Core", "ソウルコア")}</span><strong>{setup.soulCoreZone === "reserve" ? (ja ? "リザーブ" : ___bsJa("Reserve", "リザーブ")) : setup.soulCoreZone || "—"}</strong></article>
      </div>
      <p>{setup.mulliganAvailable
        ? (ja ? "スタートステップに進む前に、手札を1回引き直せます。" : ___bsJa("You may redraw your opening hand once before advancing the Start Step.", "スタート ステップに進む前に、最初の手を 1 回引き直すことができます。"))
        : setup.mulliganUsed
          ? (ja ? "引き直しは使用済みです。" : ___bsJa("Mulligan already used. Continue with this opening hand.", "マリガンはすでに使用されています。この初手のハンドを続けます。"))
          : (ja ? "この対戦では引き直せません。" : ___bsJa("Mulligan is unavailable for this match.", "この試合ではマリガンは出場できません。"))}</p>
      {setup.mulliganAvailable ? (
        <button type="button" onClick={() => onActionRequest?.({ id: "mulligan", type: "MULLIGAN" })}>
          {ja ? "手札を引き直す" : ___bsJa("Mulligan", "マリガン")}
        </button>
      ) : null}
    </section>
  );
}
