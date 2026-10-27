import { japaneseText as ___bsJa } from "../../../../localization/displayLanguage.js";
export default function ArenaVisualMatchResultActions({
  result = {},
  onRequestRematch,
  onPlayAgain,
  onAddOpponent,
  onOpenProfile,
  onExit
}) {
  return (
    <footer className="arena-visual-result-actions">
      <div>
        {result.mode === "online" ? (
          <button type="button" onClick={onRequestRematch} disabled={result.rematchPending}>
            {result.rematchPending ? ___bsJa("Waiting…", "待っている…") : ___bsJa("Request Rematch", "再戦をリクエストする")}
          </button>
        ) : (
          <button type="button" onClick={onPlayAgain}>
            {result.mode === "ranked" ? ___bsJa("Return to Ranked Queue", "ランク戦の待機列に戻る") : ___bsJa("Play Again", "もう一度プレイする")}
          </button>
        )}
        {result.opponentUsername && ["online", "ranked"].includes(result.mode) ? (
          <>
            <button type="button" onClick={onAddOpponent}>{___bsJa("Add Opponent", "対戦相手を追加")}</button>
            <button type="button" onClick={() => onOpenProfile?.(result.opponentUsername)}>{___bsJa("Open Profile", "プロフィールを開く")}</button>
          </>
        ) : null}
      </div>
      <button type="button" className="is-primary" onClick={onExit}>{___bsJa("Main Menu ", "プレイメニュー ")}<b aria-hidden="true">→</b></button>
    </footer>
  );
}
