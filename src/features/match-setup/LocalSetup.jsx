import { useMemo, useState } from "react";
import { getDecks, getProfile } from "../../services/platform/storage.js";
import { cardIndex } from "../../services/cards/cardRepository.js";
import { createMatch, validateDeck } from "../../game/state.js";
import { useLanguage } from "../../localization/i18n.jsx";
import {
  DeckPicker,
  MatchMenuButton,
  MatchSetupMenu,
  MatchSetupScreen,
  PlayerBattlePreview,
  VersusMark,
  deckIsValid,
  deckSize,
  getDeckPortrait
} from "./components/MatchSetupScreen.jsx";

function firstLabel(value, language) {
  if (language === "ja") return value === "player1" ? "プレイヤー1" : value === "player2" ? "プレイヤー2" : "ランダム";
  if (value === "player1") return "Jogador 1";
  if (value === "player2") return "Jogador 2";
  return "Aleatório";
}

function nextFirst(value) {
  if (value === "random") return "player1";
  if (value === "player1") return "player2";
  return "random";
}

export default function LocalSetup({ onBack, onStart, onDeckBuilder }) {
  const { language } = useLanguage();
  const text = (ja, portuguese) => language === "ja" ? ja : portuguese;
  const decks = useMemo(() => getDecks(), []);
  const profile = useMemo(() => getProfile() || {}, []);
  const [p1DeckId, setP1DeckId] = useState(decks[0]?.id || "");
  const [p2DeckId, setP2DeckId] = useState(decks[1]?.id || decks[0]?.id || "");
  const [p1Name, setP1Name] = useState(profile.displayName || profile.name || text("プレイヤー1", "Jogador 1"));
  const [p2Name, setP2Name] = useState(text("プレイヤー2", "Jogador 2"));
  const [first, setFirst] = useState("random");
  const [picker, setPicker] = useState(null);
  const [error, setError] = useState("");

  const p1Deck = decks.find((deck) => deck.id === p1DeckId) || null;
  const p2Deck = decks.find((deck) => deck.id === p2DeckId) || null;

  function start() {
    if (!p1Deck || !p2Deck) {
      setError(text("両プレイヤーのデッキを選択してください。", "Escolha um deck para cada jogador."));
      return;
    }

    const v1 = validateDeck(p1Deck.cards, cardIndex);
    const v2 = validateDeck(p2Deck.cards, cardIndex);
    if (!v1.ok || !v2.ok) {
      setError([...v1.errors, ...v2.errors].join(" ") || text("対戦前にデッキを確認してください。", "Revise os decks antes de iniciar."));
      return;
    }

    setError("");
    const firstPlayerId = first === "random"
      ? (Math.random() < 0.5 ? "player1" : "player2")
      : first;

    onStart(createMatch({
      player1: {
        name: p1Name.trim() || text("プレイヤー1", "Jogador 1"),
        avatar: profile.avatar || null,
        deck: p1Deck.cards
      },
      player2: {
        name: p2Name.trim() || text("プレイヤー2", "Jogador 2"),
        avatar: null,
        deck: p2Deck.cards
      },
      firstPlayerId,
      cardIndex
    }));
  }

  const noDecks = !decks.length;

  return (
    <>
      <MatchSetupScreen
        className="free-play-match-setup"
        error={error}
        footer={text("フリープレイ · 両プレイヤーを操作", "JOGO LIVRE · VOCÊ CONTROLA OS DOIS LADOS · DECKS VALIDADOS ANTES DA PARTIDA")}
        menu={
          <MatchSetupMenu eyebrow={text("ローカル対戦", "PARTIDA LOCAL")} titleTop={text("フリー", "JOGO")} titleBottom={text("プレイ", "LIVRE")} status={text("1対1", "1V1 LOCAL · CONTROLE TOTAL")}>
            <MatchMenuButton label={text("対戦を始める", "Iniciar partida")} detail={text("", "Começar o duelo")} active disabled={noDecks} onClick={start} />
            <MatchMenuButton
              label={`${text("先攻", "Primeiro")}: ${firstLabel(first, language)}`}
              detail={text("", "Clique para alternar")}
              disabled={noDecks}
              onClick={() => setFirst(nextFirst(first))}
            />
            <MatchMenuButton label={text("デッキ構築", "Deck Builder")} detail={text("", "Criar ou editar decks")} onClick={onDeckBuilder} />
            <MatchMenuButton label={text("戻る", "Voltar")} onClick={onBack} />
          </MatchSetupMenu>
        }
      >
        <div className="match-setup-duel">
          <PlayerBattlePreview
            side="left"
            kicker={text("プレイヤー1", "PLAYER 01")}
            name={p1Name}
            onNameChange={setP1Name}
            avatarSrc={profile.avatar || profile.avatarUrl || profile.avatar_url || profile.photoURL || profile.photo || null}
            bannerSrc={getDeckPortrait(p1Deck)}
            deck={p1Deck}
            deckName={p1Deck?.name || text("デッキなし", "Nenhum deck")}
            deckMeta={p1Deck ? text(`${deckSize(p1Deck)}枚 · ${deckIsValid(p1Deck) ? "使用可能" : "要確認"}`, `${deckSize(p1Deck)} cartas · ${deckIsValid(p1Deck) ? "pronto" : "revisar"}`) : text("デッキを作成してください", "crie um deck no Deck Builder")}
            onChangeDeck={noDecks ? null : () => setPicker("p1")}
          />

          <VersusMark />

          <PlayerBattlePreview
            side="right"
            kicker={text("プレイヤー2", "PLAYER 02")}
            name={p2Name}
            onNameChange={setP2Name}
            avatarSrc={null}
            bannerSrc={getDeckPortrait(p2Deck)}
            deck={p2Deck}
            deckName={p2Deck?.name || text("デッキなし", "Nenhum deck")}
            deckMeta={p2Deck ? text(`${deckSize(p2Deck)}枚 · ${deckIsValid(p2Deck) ? "使用可能" : "要確認"}`, `${deckSize(p2Deck)} cartas · ${deckIsValid(p2Deck) ? "pronto" : "revisar"}`) : text("デッキを選択", "selecione um deck")}
            onChangeDeck={noDecks ? null : () => setPicker("p2")}
          />
        </div>
      </MatchSetupScreen>

      <DeckPicker
        open={picker === "p1"}
        title={text("プレイヤー1のデッキ", "Deck do Player 1")}
        decks={decks}
        selectedId={p1DeckId}
        onSelect={setP1DeckId}
        onClose={() => setPicker(null)}
        onDeckBuilder={onDeckBuilder}
      />
      <DeckPicker
        open={picker === "p2"}
        title={text("プレイヤー2のデッキ", "Deck do Player 2")}
        decks={decks}
        selectedId={p2DeckId}
        onSelect={setP2DeckId}
        onClose={() => setPicker(null)}
        onDeckBuilder={onDeckBuilder}
      />
    </>
  );
}
