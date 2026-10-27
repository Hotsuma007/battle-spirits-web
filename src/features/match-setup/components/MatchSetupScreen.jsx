import { japaneseText as ___bsJa, isJapaneseDisplay as ___bsJapanese } from "../../../localization/displayLanguage.js";
import { useState } from "react";
import HomeWallpaperSlideshow from "../../../components/layout/HomeWallpaperSlideshow.jsx";
import PointerTiltSurface from "../../../components/layout/PointerTiltSurface.jsx";
import { cardIndex } from "../../../services/cards/cardRepository.js";
import { resolveCardImage } from "../../../game/cardAdapter.js";
import { validateDeck } from "../../../game/state.js";
import { useLanguage } from "../../../localization/i18n.jsx";
import { japaneseMatchSetupText } from "../../../localization/matchSetupText.js";
import "../../../styles/pages/matchSetupV341.css";

export function deckSize(deck) {
  return deck?.cards?.reduce(
    (sum, entry) => sum + Number(entry.quantity || entry.qty || entry.count || 0),
    0
  ) || 0;
}

function lookupCardById(value) {
  const id = String(value || "").trim();
  if (!id) return null;

  const direct = cardIndex.get(id);
  if (direct) return direct;

  const normalized = id.toUpperCase();
  for (const [cardId, card] of cardIndex.entries()) {
    if (String(cardId).trim().toUpperCase() === normalized) return card;
  }

  return null;
}

export function getDeckCoverCard(deck) {
  if (!deck) return null;

  const explicitCandidates = [
    deck.coverCardId,
    deck.coverId,
    deck.cover?.cardId,
    deck.cover?.id
  ];

  for (const candidate of explicitCandidates) {
    const card = lookupCardById(candidate);
    if (card) return card;
  }

  for (const entry of deck.cards || []) {
    const quantity = Number(entry.quantity || entry.qty || entry.count || 0);
    if (quantity <= 0) continue;

    const card = lookupCardById(entry.cardId || entry.id);
    if (card) return card;
  }

  return null;
}

export function getDeckPortrait(deck) {
  const directImage = deck?.coverImage || deck?.coverImageUrl || deck?.cover?.image || null;
  if (typeof directImage === "string" && directImage.trim()) return directImage.trim();

  const card = getDeckCoverCard(deck);
  return card ? resolveCardImage(card) : "./images/card-back.webp";
}

export function deckIsValid(deck, options = {}) {
  return deck ? validateDeck(deck.cards, cardIndex, options).ok : false;
}

export function MatchSetupScreen({ children, menu, footer, error, className = "" }) {
  const { language } = useLanguage();
  return (
    <main className={`match-setup-page ${className}`}>
      <HomeWallpaperSlideshow />
      <div className="match-setup-bg-overlay" aria-hidden="true" />
      <div className="match-setup-bg-grain" aria-hidden="true" />

      <section className="match-setup-stage">
        <div className="match-setup-versus-area">{children}</div>
        <aside className="match-setup-menu-area">{menu}</aside>
      </section>

      {error && (
        <div className="match-setup-error" role="alert">
          <strong>{language === "ja" ? "確認" : ___bsJa("ATENÇÃO", "注意")}</strong>
          <span>{language === "ja" ? japaneseMatchSetupText(error) : error}</span>
        </div>
      )}

      {footer && <footer className="match-setup-footer">{language === "ja" ? japaneseMatchSetupText(footer) : footer}</footer>}
    </main>
  );
}

function initials(value) {
  const words = String(value || "Player").trim().split(/\s+/).filter(Boolean);
  if (!words.length) return "P";
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return `${words[0][0]}${words.at(-1)[0]}`.toUpperCase();
}

function rankTheme(rank) {
  const value = String(rank || "").toLowerCase();
  if (value.includes("master")) return "master";
  if (value.includes("diamond")) return "diamond";
  if (value.includes("platinum") || value.includes("platina")) return "platinum";
  if (value.includes("gold") || value.includes("ouro")) return "gold";
  if (value.includes("silver") || value.includes("prata")) return "silver";
  if (value.includes("bronze")) return "bronze";
  return "eternal";
}

function detailPayload({ rank, status, waiting }) {
  if (rank) {
    return {
      label: "RANK",
      value: rank,
      sub: null
    };
  }

  if (status) {
    return {
      label: "STATUS",
      value: status,
      sub: null
    };
  }

  if (waiting) {
    return {
      label: "STATUS",
      value: "AGUARDANDO",
      sub: null
    };
  }

  return {
    label: "PLAYER",
    value: "SEM DETALHES",
    sub: null
  };
}

export function PlayerBattlePreview({
  side = "left",
  kicker,
  name,
  onNameChange,
  portraitSrc,
  bannerSrc,
  avatarSrc,
  deck,
  deckName,
  deckMeta,
  onChangeDeck,
  changeDeckLabel,
  status,
  rank,
  waiting = false
}) {
  const [detailsOpen, setDetailsOpen] = useState(false);
  const { language } = useLanguage();
  const coverSrc = bannerSrc || (deck ? getDeckPortrait(deck) : null);
  const avatarImage = avatarSrc || null;
  const details = detailPayload({ rank, status, waiting });
  const frameTheme = rankTheme(rank);
  const canReveal = Boolean(rank || status || waiting);

  return (
    <article className={`match-player-preview ${side} rank-theme-${frameTheme} ${waiting ? "is-waiting" : ""} ${detailsOpen ? "is-revealed" : ""}`}>
      <div className="match-player-heading">
        {kicker && <span>{language === "ja" ? japaneseMatchSetupText(kicker) : kicker}</span>}
        {onNameChange ? (
          <input
            className="match-player-name-input"
            value={name}
            onChange={(event) => onNameChange(event.target.value)}
            aria-label={language === "ja" ? "プレイヤー名" : ___bsJa("Nome do jogador", "プレイヤー名")}
          />
        ) : (
          <h2>{name}</h2>
        )}
      </div>

      <PointerTiltSurface className="match-player-banner-shell" maxTilt={6.5} glare={!waiting}>
        <button
          type="button"
          className={`match-player-banner ${canReveal ? "is-interactive" : ""}`}
          onClick={canReveal ? () => setDetailsOpen((value) => !value) : undefined}
          aria-pressed={canReveal ? detailsOpen : undefined}
          aria-label={canReveal ? `${name}: ${language === "ja" ? japaneseMatchSetupText(details.value) : details.value}` : `${name}`}
        >
          <div className="match-player-banner-frame" aria-hidden="true">
            <i className="top-line" />
            <i className="bottom-line" />
            <i className="side-line left" />
            <i className="side-line right" />
          </div>

          <span className="match-player-rank-crest" aria-hidden="true">
            <i />
            <b />
          </span>

          <div className="match-player-banner-art">
            {coverSrc ? (
              <img src={coverSrc} alt="" draggable="false" />
            ) : (
              <span className="match-player-cover-fallback">{waiting ? "?" : initials(deckName || name)}</span>
            )}
            {waiting && <div className="match-player-scan" aria-hidden="true" />}
          </div>

          <div className={`match-player-avatar-anchor ${side}`}>
            <div className="match-player-avatar-frame" aria-hidden="true" />
            <div className="match-player-avatar">
              {avatarImage ? (
                <img src={avatarImage} alt="" draggable="false" />
              ) : (
                <span>{waiting ? "?" : initials(name)}</span>
              )}
            </div>
          </div>

          <div className={`match-player-detail-panel ${detailsOpen ? "is-open" : ""}`}>
            <i className="match-player-detail-crest" aria-hidden="true" />
            <span>{language === "ja" ? japaneseMatchSetupText(details.label) : details.label}</span>
            <strong>{language === "ja" ? japaneseMatchSetupText(details.value) : details.value}</strong>
            {details.sub && <small>{details.sub}</small>}
          </div>
        </button>
      </PointerTiltSurface>

      <div className="match-change-deck-slot">
        {onChangeDeck && (
          <button type="button" className="match-change-deck" onClick={onChangeDeck}>
            {changeDeckLabel || (language === "ja" ? "デッキを変更" : ___bsJa("Trocar deck", "トロカールデッキ"))}
            <i aria-hidden="true" />
          </button>
        )}
      </div>
    </article>
  );
}

export function VersusMark({ label = "VS" }) {
  return (
    <div className="match-versus-mark" aria-hidden="true">
      <span>{label}</span>
    </div>
  );
}

export function MatchSetupMenu({ eyebrow, titleTop, titleBottom, children, status, badge }) {
  const { language } = useLanguage();
  const ja = language === "ja";
  const top = ja && titleTop === "CRIAR" ? "ルームを" : ja && titleTop === "ENTRAR EM" ? "ルームに" : ja ? japaneseMatchSetupText(titleTop) : titleTop;
  const bottom = ja && titleTop === "TIPO DE" && titleBottom === "PARTIDA" ? "選択" : ja && titleBottom === "SALA" ? (titleTop === "CRIAR" ? "作成" : "参加") : ja ? japaneseMatchSetupText(titleBottom) : titleBottom;
  return (
    <div className="match-setup-menu">
      <div className="match-setup-menu-title">
        {eyebrow && <small>{eyebrow}</small>}
        <span>{top}</span>
        <strong>{bottom}</strong>
        {badge && <em>{ja ? japaneseMatchSetupText(badge) : badge}</em>}
      </div>
      {status && <div className="match-menu-status">{ja ? japaneseMatchSetupText(status) : status}</div>}
      <nav>{children}</nav>
    </div>
  );
}

export function MatchMenuButton({ label, detail, badge, active = false, disabled = false, onClick, children }) {
  const { language } = useLanguage();
  const ja = language === "ja";
  return (
    <button
      type="button"
      className={`match-menu-button ${active ? "active" : ""}`}
      disabled={disabled}
      onClick={onClick}
    >
      <span className="match-menu-selector" aria-hidden="true" />
      <span className="match-menu-button-copy">
        <b>{ja ? japaneseMatchSetupText(label) : label}</b>
        {detail && <small>{ja ? japaneseMatchSetupText(detail) : detail}</small>}
      </span>
      {badge && <em>{ja ? japaneseMatchSetupText(badge) : badge}</em>}
      {children}
    </button>
  );
}

export function DeckPicker({ open, title = "Selecione o deck", decks, selectedId, onSelect, onClose, onDeckBuilder }) {
  const { language } = useLanguage();
  if (!open) return null;

  return (
    <div className="match-deck-picker-backdrop" onMouseDown={(event) => {
      if (event.target === event.currentTarget) onClose?.();
    }}>
      <section className="match-deck-picker" role="dialog" aria-modal="true" aria-label={title}>
        <header>
          <div>
            <span>{language === "ja" ? "デッキ選択" : ___bsJa("DECK SELECT", "デッキセレクト")}</span>
            <h3>{title}</h3>
          </div>
          <button type="button" onClick={onClose} aria-label={language === "ja" ? "閉じる" : ___bsJa("Fechar", "閉じる")}>×</button>
        </header>

        <div className="match-deck-picker-list">
          {decks.map((deck) => {
            const valid = deckIsValid(deck);
            return (
              <button
                type="button"
                key={deck.id}
                className={deck.id === selectedId ? "selected" : ""}
                onClick={() => {
                  onSelect?.(deck.id);
                  onClose?.();
                }}
              >
                <span>{deck.name}</span>
                <small>{language === "ja" ? `${deckSize(deck)}枚 · ${valid ? "使用可能" : "要確認"}` : (___bsJapanese() ? `${deckSize(deck)} カルタス · ${valid ? "PRONTO" : "REVISAR"}` : `${deckSize(deck)} CARTAS · ${valid ? "PRONTO" : "REVISAR"}`)}</small>
                <i aria-hidden="true">›</i>
              </button>
            );
          })}
        </div>

        <footer>
          {onDeckBuilder && (
            <button type="button" onClick={onDeckBuilder}>{language === "ja" ? "デッキ構築" : ___bsJa("Abrir Deck Builder", "デッキビルダーを開く")}</button>
          )}
          <button type="button" onClick={onClose}>{language === "ja" ? "戻る" : ___bsJa("Voltar", "戻る")}</button>
        </footer>
      </section>
    </div>
  );
}
