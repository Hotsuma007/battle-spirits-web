import { japaneseResultReason } from "../../../localization/matchResult.js";
import { japaneseText as ___bsJa, isJapaneseDisplay as ___bsJapanese } from "../../../localization/displayLanguage.js";
import { formatMatchDuration } from "../../../services/player/postMatchService.js";

function initials(name) {
  return String(name || "?")
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0] || "")
    .join("")
    .toUpperCase() || "?";
}

function reasonCopy(reason, defeatedName, language) {
  if (language === "ja") return japaneseResultReason(reason, defeatedName);
  const en = language === "en";
  if (reason === "life") return {
    title: en ? "Life depleted" : "Life reduzida a 0",
    text: en ? `${defeatedName} has no Life remaining.` : `${defeatedName} ficou sem Life.`
  };
  if (reason === "deck") return {
    title: en ? "Deck depleted" : "Deck esgotado",
    text: en ? `${defeatedName} can no longer continue with an empty Deck.` : `${defeatedName} não pode continuar com o Deck vazio.`
  };
  if (reason === "turn_timeout") return {
    title: en ? "Turn timer expired" : "Tempo do turno esgotado",
    text: en ? `${defeatedName} ran out of turn time.` : `${defeatedName} ficou sem tempo no turno.`
  };
  if (reason === "disconnect_timeout") return {
    title: en ? "Connection timeout" : "Tempo de reconexão esgotado",
    text: en ? `${defeatedName} did not reconnect in time.` : `${defeatedName} não voltou à partida dentro do prazo.`
  };
  if (reason === "concede" || reason === "surrender") return {
    title: en ? "Concession" : "Desistência",
    text: en ? `${defeatedName} conceded the match.` : `${defeatedName} desistiu da partida.`
  };
  return {
    title: en ? "Victory condition" : "Condição de vitória",
    text: en ? "The match victory condition was reached." : "A condição de vitória da partida foi alcançada."
  };
}

export default function MatchResultScreen({
  language = "ptBR",
  winner,
  defeated,
  isDefeat = false,
  reason = "other",
  turnNumber,
  summary,
  masteryImageSrc = null,
  masteryCardName = "",
  rankedDelta = 0,
  postMatchActionNotice = "",
  mode = "local",
  rematchPending = false,
  opponentUsername = "",
  onRequestRematch,
  onPlayAgain,
  onAddOpponent,
  onOpenProfile,
  onExit,
  mainMenuLabel = "Menu principal",
  serverVerified = false
}) {
  const en = language === "en";
  const copy = reasonCopy(reason, defeated?.name || (en ? "The opponent" : "O oponente"), language);

  return (
    <div
      className={`game-result-overlay ${isDefeat ? "is-defeat" : "is-victory"}`}
      role="dialog"
      aria-modal="true"
      aria-label={en ? ___bsJa("Match result", "試合結果") : ___bsJa("Resultado da partida", "試合結果")}
    >
      <section className="game-result-card">
        <div className="game-result-ambient" />

        <header className="game-result-header">
          <span className="game-result-kicker">{en ? ___bsJa("MATCH COMPLETE", "試合が完了しました") : ___bsJa("PARTIDA ENCERRADA", "試合終了")}</span>
          {serverVerified && <span className="game-result-server-verified">{en ? ___bsJa("SERVER VERIFIED", "サーバー認証済み") : ___bsJa("VALIDADO PELO SERVIDOR", "サーバーによる検証済み")}</span>}
          <div className="game-result-badge"><span>{isDefeat ? (en ? ___bsJa("DEFEAT", "敗北") : ___bsJa("DERROTA", "敗北")) : (en ? ___bsJa("VICTORY", "勝利") : ___bsJa("VITÓRIA", "勝利"))}</span></div>
          <h2>{isDefeat
            ? (en ? (___bsJapanese() ? `${winner?.name || "Opponent"} が試合に勝ちました` : `${winner?.name || "Opponent"} won the match`) : (___bsJapanese() ? `${winner?.name || "Oponente"} が試合に勝ちました` : `${winner?.name || "Oponente"} venceu a partida`))
            : (en ? (___bsJapanese() ? `${winner?.name || "Player"} が勝利しました` : `${winner?.name || "Player"} is victorious`) : (___bsJapanese() ? `${winner?.name || "Jogador"}が勝ちました！` : `${winner?.name || "Jogador"} venceu!`))}</h2>
          <p>{isDefeat
            ? (en ? ___bsJa("The duel is over. Review the result and prepare for the next battle.", "決闘は終わりました。結果を確認し、次の戦いに備えます。") : ___bsJa("O duelo terminou. Confira o resultado e prepare-se para a próxima batalha.", "決闘は終わりました。結果を確認して次の戦いに備えましょう。"))
            : (en ? ___bsJa("The final blow was dealt. The duel belongs to the winner.", "最後の一撃が与えられた。決闘は勝者のものです。") : ___bsJa("O golpe final foi dado. O duelo pertence ao vencedor.", "最後の一撃が与えられた。決闘は勝者のものです。"))}</p>
        </header>

        <div className="game-result-versus">
          <article className="game-result-player winner" style={{ "--result-player-color": winner?.playerColor || "#d8d8d8" }}>
            <span className="game-result-player-label">{en ? ___bsJa("WINNER", "勝者") : ___bsJa("VENCEDOR", "勝者")}</span>
            <div className="game-result-avatar">{winner?.avatar ? <img src={winner.avatar} alt="" /> : <span>{initials(winner?.name)}</span>}</div>
            <strong>{winner?.name || (en ? ___bsJa("Player", "プレイヤー") : ___bsJa("Jogador", "プレーヤー"))}</strong>
            <small>{en ? ___bsJa("Victory", "勝利") : ___bsJa("Vitória", "勝利")}</small>
          </article>

          <div className="game-result-vs-mark">{"VS"}</div>

          <article className="game-result-player defeated" style={{ "--result-player-color": defeated?.playerColor || "#929292" }}>
            <span className="game-result-player-label">{en ? ___bsJa("DEFEATED", "敗北") : ___bsJa("DERROTADO", "敗北")}</span>
            <div className="game-result-avatar">{defeated?.avatar ? <img src={defeated.avatar} alt="" /> : <span>{initials(defeated?.name)}</span>}</div>
            <strong>{defeated?.name || (en ? ___bsJa("Player", "プレイヤー") : ___bsJa("Jogador", "プレーヤー"))}</strong>
            <small>{en ? ___bsJa("Defeat", "敗北") : ___bsJa("Derrota", "敗北")}</small>
          </article>
        </div>

        <div className="game-result-summary">
          <div><span>{en ? ___bsJa("RESULT", "結果") : ___bsJa("RESULTADO", "結果")}</span><strong>{copy.title}</strong><p>{copy.text}</p></div>
          <div className="game-result-turn"><span>{en ? ___bsJa("FINAL TURN", "最終ターン") : ___bsJa("TURNO FINAL", "最終ターン")}</span><strong>{turnNumber || "-"}</strong></div>
        </div>

        <section className="post-match-v380-grid" aria-label={en ? ___bsJa("Match details", "試合詳細") : ___bsJa("Detalhes da partida", "試合詳細")}>
          <article><span>{en ? ___bsJa("DURATION", "対戦時間") : ___bsJa("DURAÇÃO", "対戦時間")}</span><strong>{formatMatchDuration(summary?.durationSeconds || 0, language)}</strong><small>{summary?.turns || turnNumber || 1} {en ? ___bsJa("turns", "ターン") : ___bsJa("turnos", "ターン")}</small></article>
          <article><span>{___bsJa("DECK", "デッキ")}</span><strong>{summary?.deck?.name || (en ? ___bsJa("Unidentified", "不明") : ___bsJa("Não identificado", "不明"))}</strong><small>{summary?.deck?.cardIds?.length ? (language === "ja" ? `${summary.deck.cardIds.length}枚` : `${summary.deck.cardIds.length} ${en ? "cards" : "cartas"}`) : (en ? ___bsJa("Match snapshot", "対戦時のデッキ") : ___bsJa("Snapshot da partida", "対戦時のデッキ"))}</small></article>
          <article><span>{en ? ___bsJa("LIFE REMAINING", "残りのライフ") : ___bsJa("LIFE RESTANTE", "残りライフ")}</span><strong>{summary?.lifeRemaining ?? "—"}</strong><small>{summary?.result === "win" ? (en ? ___bsJa("Your final Life", "対戦終了時のライフ") : ___bsJa("Seu Life final", "対戦終了時のライフ")) : (en ? ___bsJa("At match end", "試合終了時") : ___bsJa("Ao encerrar", "対戦終了時"))}</small></article>
          <article className="post-match-mastery-stat"><span>{___bsJa("CARD MASTERY", "カードマスタリー")}</span><strong>+{summary?.mastery?.totalXp || 0}{___bsJa(" XP", " 経験値")}</strong><small>{summary?.mastery?.trackedCards || 0} {en ? ___bsJa("cards progressed", "枚のカードに経験値を獲得") : ___bsJa("cartas progrediram", "枚のカードに経験値を獲得")}</small></article>
        </section>

        {(masteryImageSrc || summary?.ranked) && (
          <section className="post-match-v380-progression">
            {masteryImageSrc && (
              <article className="post-match-featured-mastery">
                <div className="post-match-featured-card"><img src={masteryImageSrc} alt={masteryCardName} /></div>
                <div><span>{en ? ___bsJa("MASTERY HIGHLIGHT", "マスタリーハイライト") : ___bsJa("DESTAQUE DE MAESTRIA", "マスタリーハイライト")}</span><strong>{masteryCardName}</strong><small>+{summary?.mastery?.featuredXp || 0}{___bsJa(" XP · ", " XP・ ")}{summary?.deck?.coverCardId === summary?.mastery?.featuredCardId ? (en ? ___bsJa("Deck cover bonus", "デッキカバー特典") : ___bsJa("Bônus de carta de capa", "カバーカードのボーナス")) : (en ? ___bsJa("Used in this duel", "今回の決闘で使用した") : ___bsJa("Utilizada neste duelo", "今回の決闘で使用した"))}</small></div>
              </article>
            )}
            {summary?.ranked && (
              <article className={`post-match-ranked-change ${rankedDelta >= 0 ? "positive" : "negative"}`}>
                <span>{___bsJa("RANKED / SEASON 0", "ランク戦 / シーズン0")}</span><strong>{rankedDelta >= 0 ? "+" : ""}{rankedDelta} RP</strong><small>{summary.ranked.rpBefore} → {summary.ranked.rpAfter} RP</small><b>{summary.ranked.rank || "—"}</b>
              </article>
            )}
          </section>
        )}

        {postMatchActionNotice && <div className="post-match-action-notice" role="status">{postMatchActionNotice}</div>}

        <footer className="game-result-actions post-match-v380-actions">
          <div className="post-match-secondary-actions">
            {mode === "online" && <button type="button" onClick={onRequestRematch} disabled={rematchPending}>{rematchPending ? (en ? ___bsJa("Waiting…", "待っている…") : ___bsJa("Aguardando…", "待っている…")) : (en ? ___bsJa("Request rematch", "再戦をリクエストする") : ___bsJa("Pedir revanche", "再戦を申し込む"))}</button>}
            {mode !== "online" && <button type="button" onClick={onPlayAgain}>{mode === "ranked" ? (en ? ___bsJa("Return to Ranked queue", "ランク戦の待機列に戻る") : ___bsJa("Voltar à fila Ranked", "ランク戦の待機列に戻る")) : (en ? ___bsJa("Play again", "もう一度対戦する") : ___bsJa("Jogar novamente", "もう一度対戦する"))}</button>}
            {opponentUsername && (mode === "online" || mode === "ranked") && (
              <>
                <button type="button" onClick={onAddOpponent}>{en ? ___bsJa("Add opponent", "対戦相手を追加") : ___bsJa("Adicionar adversário", "対戦相手を追加")}</button>
                <button type="button" onClick={() => onOpenProfile?.(opponentUsername)}>{en ? ___bsJa("Open profile", "プロフィールを開く") : ___bsJa("Abrir perfil", "プロフィールを開く")}</button>
              </>
            )}
          </div>
          <button type="button" className="game-result-main-button" onClick={onExit}><span>{mainMenuLabel}</span><b aria-hidden="true">→</b></button>
        </footer>
      </section>
    </div>
  );
}
