import { japaneseText as ___bsJa } from "../../../localization/displayLanguage.js";
export default function FriendChallengePrompt({ challenge, busy = false, onAccept, onDecline }) {
  if (!challenge) return null;
  const profile = challenge.challengerProfile || {};
  const name = profile.name || profile.displayName || "Jogador";
  return (
    <div className="friend-challenge-overlay" role="dialog" aria-modal="true" aria-label={___bsJa("Desafio de amigo", "フレンドチャレンジ")}>
      <section className="friend-challenge-card">
        <span className="friend-challenge-kicker">{___bsJa("FRIEND CHALLENGE", "フレンドチャレンジ")}</span>
        <div className="friend-challenge-identity">
          <div className="friend-challenge-avatar">
            {profile.avatar ? <img src={profile.avatar} alt="" /> : <span>{String(name).slice(0, 1).toUpperCase()}</span>}
          </div>
          <div>
            <strong>{name}</strong>
            <small>{profile.username ? `@${profile.username}` : ___bsJa("Amigo Online", "オンラインフレンド")}</small>
          </div>
        </div>
        <p>{___bsJa("quer desafiar você para uma partida privada.", "プライベートマッチに挑戦したいと考えています。")}</p>
        <div className="friend-challenge-actions">
          <button type="button" disabled={busy} onClick={onDecline}>{___bsJa("Recusar", "拒否する")}</button>
          <button type="button" className="primary" disabled={busy} onClick={onAccept}>{busy ? ___bsJa("Preparando...", "準備中...") : ___bsJa("Aceitar desafio", "挑戦を受け入れる")}</button>
        </div>
      </section>
    </div>
  );
}
