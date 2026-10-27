import { useMemo, useState } from "react";
import { getDecks, getProfile } from "../../services/platform/storage.js";
import { cardIndex } from "../../services/cards/cardRepository.js";
import { createMatch, validateDeck } from "../../game/state.js";
import { analyzeDeckArchetype } from "../../game/aiArchetypes.js";
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

function difficultyName(value, language) {
  if (language === "ja") return value === "easy" ? "やさしい" : value === "hard" ? "むずかしい" : "ふつう";
  if (value === "easy") return "Fácil";
  if (value === "hard") return "Difícil";
  return "Normal";
}

function nextDifficulty(value) {
  if (value === "easy") return "normal";
  if (value === "normal") return "hard";
  return "easy";
}

function firstLabel(value, language) {
  if (language === "ja") return value === "player1" ? "自分" : value === "player2" ? "CPU" : "ランダム";
  if (value === "player1") return "Você";
  if (value === "player2") return "CPU";
  return "Aleatório";
}

function nextFirst(value) {
  if (value === "random") return "player1";
  if (value === "player1") return "player2";
  return "random";
}

export default function AiSetup({ onBack, onStart, onDeckBuilder }) {
  const { language } = useLanguage();
  const text = (ja, portuguese) => language === "ja" ? ja : portuguese;
  const decks = useMemo(() => getDecks(), []);
  const profile = useMemo(() => getProfile() || {}, []);
  const [playerDeckId, setPlayerDeckId] = useState(decks[0]?.id || "");
  const [cpuDeckId, setCpuDeckId] = useState(decks[1]?.id || decks[0]?.id || "");
  const [difficulty, setDifficulty] = useState("normal");
  const [first, setFirst] = useState("random");
  const [picker, setPicker] = useState(null);
  const [error, setError] = useState("");

  const playerDeck = decks.find((deck) => deck.id === playerDeckId) || null;
  const cpuDeck = decks.find((deck) => deck.id === cpuDeckId) || null;
  const cpuArchetype = useMemo(
    () => analyzeDeckArchetype(cpuDeck?.cards || [], cardIndex),
    [cpuDeck]
  );

  function start() {
    if (!playerDeck || !cpuDeck) {
      setError(text("自分と CPU のデッキを選択してください。", "Escolha um deck para você e um deck para a Eternal CPU."));
      return;
    }

    const humanValidation = validateDeck(playerDeck.cards, cardIndex);
    const cpuValidation = validateDeck(cpuDeck.cards, cardIndex);
    if (!humanValidation.ok || !cpuValidation.ok) {
      setError([...humanValidation.errors, ...cpuValidation.errors].join(" "));
      return;
    }

    setError("");
    const firstPlayerId = first === "random"
      ? (Math.random() < 0.5 ? "player1" : "player2")
      : first;

    const match = createMatch({
      player1: {
        name: profile.displayName || profile.name || text("プレイヤー", "Jogador"),
        avatar: profile.avatar || null,
        deck: playerDeck.cards
      },
      player2: {
        name: `CPU · ${difficultyName(difficulty, language)}`,
        avatar: null,
        deck: cpuDeck.cards
      },
      firstPlayerId,
      cardIndex,
      seed: `cpu-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
    });

    onStart({
      ...match,
      ai: {
        version: 5,
        playerId: "player2",
        humanPlayerId: "player1",
        difficulty,
        archetypeProfile: cpuArchetype,
        debugEnabled: false
      }
    });
  }

  const noDecks = !decks.length;
  const cpuStyle = cpuArchetype?.top?.slice(0, 2).map((item) => item.labelPT).join(" / ") || "Equilibrado";

  return (
    <>
      <MatchSetupScreen
        className="cpu-match-setup"
        error={error}
        footer={text(`CPU 対戦 · ${difficultyName(difficulty, language)}`, `ETERNAL CPU · ${difficultyName(difficulty, language)} · ${cpuStyle}`)}
        menu={
          <MatchSetupMenu eyebrow={text("ローカル対戦", "PARTIDA LOCAL")} titleTop={text("CPU", "ETERNAL")} titleBottom={text("対戦", "CPU")} status={language === "ja" ? "" : `ESTILO: ${cpuStyle.toUpperCase()}`} badge="CPU">
            <MatchMenuButton label={text("対戦を始める", "Iniciar partida")} detail={text("", "Enfrentar a Eternal CPU")} active disabled={noDecks} onClick={start} />
            <MatchMenuButton
              label={`${text("難易度", "Dificuldade")}: ${difficultyName(difficulty, language)}`}
              detail={language === "ja" ? "" : difficulty === "hard" ? "Desafio máximo" : difficulty === "easy" ? "Mais tranquila para aprender" : "Desafio equilibrado"}
              disabled={noDecks}
              onClick={() => setDifficulty(nextDifficulty(difficulty))}
            />
            <MatchMenuButton
              label={`${text("先攻", "Primeiro")}: ${firstLabel(first, language)}`}
              detail={text("", "Clique para alternar")}
              disabled={noDecks}
              onClick={() => setFirst(nextFirst(first))}
            />
            <MatchMenuButton label={text("デッキ構築", "Deck Builder")} onClick={onDeckBuilder} />
            <MatchMenuButton label={text("戻る", "Voltar")} onClick={onBack} />
          </MatchSetupMenu>
        }
      >
        <div className="match-setup-duel">
          <PlayerBattlePreview
            side="left"
            kicker={text("自分", "PLAYER")}
            name={profile.displayName || profile.name || text("プレイヤー", "Jogador")}
            avatarSrc={profile.avatar || profile.avatarUrl || profile.avatar_url || profile.photoURL || profile.photo || null}
            bannerSrc={getDeckPortrait(playerDeck)}
            deck={playerDeck}
            deckName={playerDeck?.name || text("デッキなし", "Nenhum deck")}
            deckMeta={playerDeck ? text(`${deckSize(playerDeck)}枚 · ${deckIsValid(playerDeck) ? "使用可能" : "要確認"}`, `${deckSize(playerDeck)} cartas · ${deckIsValid(playerDeck) ? "pronto" : "revisar"}`) : text("デッキを選択", "selecione um deck")}
            onChangeDeck={noDecks ? null : () => setPicker("player")}
          />

          <VersusMark />

          <PlayerBattlePreview
            side="right"
            kicker={text("エターナルCPU", "ETERNAL CPU")}
            name={text("エターナルCPU", "ETERNAL CPU")}
            rank={text(difficultyName(difficulty, language), `${difficultyName(difficulty, language)} · ${cpuStyle}`)}
            avatarSrc={null}
            bannerSrc={getDeckPortrait(cpuDeck)}
            deck={cpuDeck}
            deckName={cpuDeck?.name || text("デッキなし", "Nenhum deck")}
            deckMeta={cpuDeck ? text(`${deckSize(cpuDeck)}枚 · ${deckIsValid(cpuDeck) ? "使用可能" : "要確認"}`, `${deckSize(cpuDeck)} cartas · ${deckIsValid(cpuDeck) ? "pronto" : "revisar"}`) : text("デッキを選択", "selecione um deck")}
            onChangeDeck={noDecks ? null : () => setPicker("cpu")}
          />
        </div>
      </MatchSetupScreen>

      <DeckPicker
        open={picker === "player"}
        title={text("自分のデッキ", "SEU DECK")}
        decks={decks}
        selectedId={playerDeckId}
        onSelect={setPlayerDeckId}
        onClose={() => setPicker(null)}
        onDeckBuilder={onDeckBuilder}
      />
      <DeckPicker
        open={picker === "cpu"}
        title={text("CPU のデッキ", "DECK DA ETERNAL CPU")}
        decks={decks}
        selectedId={cpuDeckId}
        onSelect={setCpuDeckId}
        onClose={() => setPicker(null)}
        onDeckBuilder={onDeckBuilder}
      />
    </>
  );
}
