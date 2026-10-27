import { japaneseText as ___bsJa } from "../../../../localization/displayLanguage.js";
export default function ArenaVisualPostMatchSocialActions({
  result = {},
  onRequestRematch,
  onPlayAgain,
  onAddOpponent,
  onOpenProfile,
  onExit
}) {
  const online = ["online", "ranked"].includes(result.mode);
  return (
    <footer className="arena-visual-postmatch-social-actions">
      <div className="arena-visual-postmatch-primary-actions">
        {result.mode === "online" ? (
          <button type="button" onClick={onRequestRematch} disabled={result.rematchPending}>
            {result.rematchPending ? ___bsJa("Waiting for Opponent…", "相手を待っています…") : ___bsJa("Request Rematch", "再戦をリクエストする")}
          </button>
        ) : (
          <button type="button" onClick={onPlayAgain}>
            {result.mode === "ranked" ? ___bsJa("Return to Ranked Queue", "ランク戦の待機列に戻る") : ___bsJa("Play Again", "もう一度プレイする")}
          </button>
        )}
        <button type="button" className="is-primary" onClick={onExit}>{___bsJa("Main Menu ", "プレイメニュー ")}<b aria-hidden="true">→</b></button>
      </div>

      {online ? (
        <div className="arena-visual-postmatch-social-row">
          <span>{___bsJa("Opponent", "相手")}</span>
          <strong>{result.opponentUsername ? `@${result.opponentUsername}` : ___bsJa("No public username", "公開ユーザー名なし")}</strong>
          <div>
            <button type="button" disabled={!result.opponentUsername} onClick={onAddOpponent}>{___bsJa("Add Opponent", "対戦相手を追加")}</button>
            <button type="button" disabled={!result.opponentUsername} onClick={() => onOpenProfile?.(result.opponentUsername)}>{___bsJa("Open Profile", "プロフィールを開く")}</button>
          </div>
        </div>
      ) : null}
    </footer>
  );
}
