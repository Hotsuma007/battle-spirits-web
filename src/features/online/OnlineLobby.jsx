import { japaneseMatchSetupText } from "../../localization/matchSetupText.js";
import { japaneseText as ___bsJa, isJapaneseDisplay as ___bsJapanese } from "../../localization/displayLanguage.js";
import {
  useEffect,
  useMemo,
  useRef,
  useState
} from "react";

import EmptyState from "../../components/common/EmptyState.jsx";
import QueueStatus from "./components/QueueStatus.jsx";
import ReadyCheck from "./components/ReadyCheck.jsx";
import PreMatchVersus from "./components/PreMatchVersus.jsx";
import FriendChallengePrompt from "./components/FriendChallengePrompt.jsx";

import {
  getDecks,
  getProfile,
  getSettings
} from "../../services/platform/storage.js";

import {
  createOnlineClient
} from "../../online/socketClient.js";

import {
  ONLINE_SERVER_URL
} from "../../app/config/online.js";

import {
  createOnlinePublicProfile
} from "../../online/publicProfile.js";

import {
  getAccountAccessToken,
  loadFriends
} from "../../services/player/socialService.js";

import {
  deckValidationOptionsForSettings
} from "../../online/customMatchSettings.js";

import {
  onlineErrorMessage,
  onlineConnectionErrorMessage
} from "../../online/errors/onlineErrorMessages.js";

import {
  DeckPicker,
  MatchMenuButton,
  MatchSetupMenu,
  MatchSetupScreen,
  PlayerBattlePreview,
  VersusMark,
  deckIsValid,
  deckSize,
  getDeckPortrait,
  getDeckCoverCard
} from "../match-setup/components/MatchSetupScreen.jsx";

import "../../styles/theme/v230.css";
import "../../styles/pages/onlineLobbySafe.css";
import "../../styles/pages/onlineMatchmakingV500.css";
import "../../styles/pages/onlinePreMatchV500.css";
import "../../styles/pages/onlineSocialMatchV500.css";



export default function OnlineLobby({
  onBack,
  onMatch,
  onDeckBuilder
}) {
  const decks = getDecks();
  const profile = getProfile();
  const initialSettings = getSettings();

  const [deckId, setDeckId] = useState(
    decks[0]?.id || ""
  );

  const [playerColor, setPlayerColor] =
    useState(
      initialSettings.onlinePlayerColor ||
        initialSettings.preferredPlayerColor ||
        "#d8d8d8"
    );

  const [joinCode, setJoinCode] =
    useState("");

  const [joinPassword, setJoinPassword] = useState("");
  const [roomTitle, setRoomTitle] = useState(`${profile?.displayName || profile?.name || "Jogador"} · Casual`);
  const [roomVisibility, setRoomVisibility] = useState("public");
  const [roomPassword, setRoomPassword] = useState("");
  const [spectatorsAllowed, setSpectatorsAllowed] = useState(false);
  const [firstPlayerMode, setFirstPlayerMode] = useState("random");
  const [turnTimerSeconds, setTurnTimerSeconds] = useState(0);
  const [mulliganEnabled, setMulliganEnabled] = useState(true);
  const [roomRuleset, setRoomRuleset] = useState("eternal");
  const [lobbySnapshot, setLobbySnapshot] = useState({ rooms: [], players: [], counts: {} });
  const [roomFilter, setRoomFilter] = useState("open");

  const [room, setRoom] =
    useState(null);

  const [status, setStatus] =
    useState("desconectado");

  const [error, setError] =
    useState("");

  const [panelMode, setPanelMode] = useState("root");
  const [deckPickerOpen, setDeckPickerOpen] = useState(false);

  const [
    searching,
    setSearching
  ] = useState(false);

  const [
    searchMessage,
    setSearchMessage
  ] = useState("");

  const [readyCheck, setReadyCheck] = useState(null);
  const [readySubmitting, setReadySubmitting] = useState(false);
  const [preMatch, setPreMatch] = useState(null);
  const [socialFriends, setSocialFriends] = useState([]);
  const [accountAccessToken, setAccountAccessToken] = useState(null);
  const [incomingChallenge, setIncomingChallenge] = useState(null);
  const [challengeBusy, setChallengeBusy] = useState(false);
  const [outgoingChallengeId, setOutgoingChallengeId] = useState(null);

  const handedOffRef =
    useRef(false);

  const preMatchRef = useRef(null);
  const pendingMatchStateRef = useRef(null);
  const preMatchElapsedRef = useRef(false);
  const preMatchTimerRef = useRef(null);

  const searchingRef =
    useRef(false);

  const deckIdRef =
    useRef(deckId);

  const playerColorRef =
    useRef(playerColor);

  const client = useMemo(
    () =>
      createOnlineClient(
        ONLINE_SERVER_URL
      ),
    []
  );

  useEffect(() => {
    deckIdRef.current =
      deckId;
  }, [deckId]);

  useEffect(() => {
    playerColorRef.current =
      playerColor;
  }, [playerColor]);

  function updateSearching(
    value,
    message = ""
  ) {
    searchingRef.current =
      value;

    setSearching(value);
    setSearchMessage(message);
  }

  function currentDeck() {
    return decks.find(
      (deck) =>
        deck.id ===
        deckIdRef.current
    );
  }

  async function currentOnlineProfile() {
    return createOnlinePublicProfile(
      profile || {},
      playerColorRef.current
    );
  }

  useEffect(() => {
    let active = true;
    Promise.all([getAccountAccessToken(), loadFriends()])
      .then(([token, friends]) => {
        if (!active) return;
        setAccountAccessToken(token || null);
        setSocialFriends(Array.isArray(friends) ? friends : []);
      })
      .catch(() => {
        if (!active) return;
        setAccountAccessToken(null);
        setSocialFriends([]);
      });
    return () => { active = false; };
  }, []);

  const friendUsernames = useMemo(() => new Set(
    socialFriends
      .map((friend) => String(friend?.username || friend?.friend_username || "").replace(/^@/, "").trim().toLowerCase())
      .filter(Boolean)
  ), [socialFriends]);

  function isFriendLobbyPlayer(entry) {
    const username = String(entry?.profile?.username || "").replace(/^@/, "").trim().toLowerCase();
    return Boolean(username && friendUsernames.has(username));
  }

  useEffect(() => {
    const socket =
      client.socket;

    const onConnect = async () => {
      setStatus("conectado");
      setError("");
      try {
        const accessToken = await getAccountAccessToken();
        setAccountAccessToken(accessToken || null);
        socket.emit("lobby:identify", { profile: await currentOnlineProfile(), accessToken }, (result) => {
          if (result?.snapshot) setLobbySnapshot(result.snapshot);
        });
      } catch {}
    };

    const onDisconnect = () => {
      setStatus(
        "desconectado"
      );
    };

    const onConnectError = (connectionError) => {
      setStatus("erro");
      setError(onlineConnectionErrorMessage(___bsJapanese() ? "ja" : "ptBR"));
    };

    const handoffMatch = (state) => {
      if (!state?.started || !state?.match || handedOffRef.current) return;
      handedOffRef.current = true;
      updateSearching(false);
      preMatchRef.current = null;
      pendingMatchStateRef.current = null;
      preMatchElapsedRef.current = false;
      setPreMatch(null);

      onMatch({
        match: state.match,
        onlineClient: client,
        roomState: state,
        viewerPlayerId: state.viewerPlayerId
      });
    };

    const onState = (
      state
    ) => {
      setRoom((previous) => ({
        ...state,
        chat: state.chat ?? previous?.chat ?? []
      }));

      if (state.started && state.match) {
        if (preMatchRef.current && !preMatchElapsedRef.current) {
          pendingMatchStateRef.current = state;
          return;
        }
        handoffMatch(state);
      }
    };

    const onMatchmakingStatus = (payload) => {
      if (payload?.status !== QueueStatus.SEARCHING) return;
      setReadyCheck(null);
      setReadySubmitting(false);
      setPreMatch(null);
      preMatchRef.current = null;
      updateSearching(true, payload?.message || "Procurando outro jogador...");
    };

    const onReadyCheck = (payload) => {
      if (!payload?.readyCheckId) return;
      setError("");
      setReadyCheck(payload);
      setReadySubmitting(false);
      updateSearching(true, "Partida encontrada. Confirme para continuar.");
    };

    const onReadyStatus = (payload) => {
      if (!payload?.readyCheckId) return;
      setReadyCheck((current) => current?.readyCheckId === payload.readyCheckId
        ? { ...current, ...payload }
        : payload);
    };

    const onMatchmakingMatched = (payload) => {
      if (!payload?.code || !payload?.playerId || !payload?.resumeToken) return;
      client.adoptSession(payload);
      setReadyCheck(null);
      setReadySubmitting(false);
      updateSearching(false, "Partida confirmada.");

      const presentation = payload?.preMatch || null;
      if (!presentation) {
        preMatchElapsedRef.current = true;
        if (pendingMatchStateRef.current) handoffMatch(pendingMatchStateRef.current);
        return;
      }

      preMatchRef.current = presentation;
      preMatchElapsedRef.current = false;
      setPreMatch(presentation);

      if (preMatchTimerRef.current) clearTimeout(preMatchTimerRef.current);
      preMatchTimerRef.current = setTimeout(() => {
        preMatchElapsedRef.current = true;
        const pending = pendingMatchStateRef.current;
        if (pending) handoffMatch(pending);
      }, 1800);
    };

    const onMatchmakingFailed = (payload) => {
      setReadyCheck(null);
      setReadySubmitting(false);
      setPreMatch(null);
      preMatchRef.current = null;
      pendingMatchStateRef.current = null;
      preMatchElapsedRef.current = false;

      if (payload?.requeued) {
        updateSearching(true, "Procurando outro jogador...");
        setError("");
        return;
      }

      updateSearching(false);
      setError(onlineErrorMessage(payload, { language: ___bsJapanese() ? "ja" : "ptBR", fallback: "A busca foi interrompida." }));
    };

    const onLobbySnapshot = (snapshot) => {
      if (snapshot) setLobbySnapshot(snapshot);
    };

    const onChallengeIncoming = (payload) => {
      if (!payload?.challengeId) return;
      setIncomingChallenge(payload);
      setChallengeBusy(false);
      setError("");
    };

    const onChallengeStatus = (payload) => {
      if (!payload?.challengeId) return;
      setOutgoingChallengeId(payload.challengeId);
      setSearchMessage("Desafio enviado. Aguardando resposta do amigo...");
    };

    const onChallengeFailed = (payload) => {
      setIncomingChallenge((current) => current?.challengeId === payload?.challengeId ? null : current);
      setOutgoingChallengeId((current) => current === payload?.challengeId ? null : current);
      setChallengeBusy(false);
      if (payload?.error) setError(onlineErrorMessage(payload, { language: ___bsJapanese() ? "ja" : "ptBR", fallback: "O desafio foi encerrado." }));
    };

    const onChallengeMatched = (payload) => {
      if (!payload?.code || !payload?.playerId || !payload?.resumeToken) return;
      client.adoptSession(payload);
      setIncomingChallenge(null);
      setOutgoingChallengeId(null);
      setChallengeBusy(false);
      updateSearching(false, "Desafio aceito.");

      const presentation = payload?.preMatch || null;
      if (!presentation) {
        preMatchElapsedRef.current = true;
        if (pendingMatchStateRef.current) handoffMatch(pendingMatchStateRef.current);
        return;
      }

      preMatchRef.current = presentation;
      preMatchElapsedRef.current = false;
      setPreMatch(presentation);
      if (preMatchTimerRef.current) clearTimeout(preMatchTimerRef.current);
      preMatchTimerRef.current = setTimeout(() => {
        preMatchElapsedRef.current = true;
        const pending = pendingMatchStateRef.current;
        if (pending) handoffMatch(pending);
      }, 1800);
    };

    socket.on("lobby:snapshot", onLobbySnapshot);
    socket.on("challenge:incoming", onChallengeIncoming);
    socket.on("challenge:status", onChallengeStatus);
    socket.on("challenge:failed", onChallengeFailed);
    socket.on("challenge:matched", onChallengeMatched);

    socket.on(
      "connect",
      onConnect
    );

    socket.on(
      "disconnect",
      onDisconnect
    );

    socket.on(
      "connect_error",
      onConnectError
    );

    socket.on(
      "room:state",
      onState
    );

    socket.on(
      "matchmaking:status",
      onMatchmakingStatus
    );

    socket.on("matchmaking:readyCheck", onReadyCheck);
    socket.on("matchmaking:readyStatus", onReadyStatus);
    socket.on("matchmaking:matched", onMatchmakingMatched);

    socket.on(
      "matchmaking:failed",
      onMatchmakingFailed
    );

    client.connect();

    return () => {
      socket.off("lobby:snapshot", onLobbySnapshot);
      socket.off("challenge:incoming", onChallengeIncoming);
      socket.off("challenge:status", onChallengeStatus);
      socket.off("challenge:failed", onChallengeFailed);
      socket.off("challenge:matched", onChallengeMatched);

      socket.off(
        "connect",
        onConnect
      );

      socket.off(
        "disconnect",
        onDisconnect
      );

      socket.off(
        "connect_error",
        onConnectError
      );

      socket.off(
        "room:state",
        onState
      );

      socket.off(
        "matchmaking:status",
        onMatchmakingStatus
      );

      socket.off("matchmaking:readyCheck", onReadyCheck);
      socket.off("matchmaking:readyStatus", onReadyStatus);
      socket.off("matchmaking:matched", onMatchmakingMatched);

      socket.off(
        "matchmaking:failed",
        onMatchmakingFailed
      );

      if (preMatchTimerRef.current) clearTimeout(preMatchTimerRef.current);

      if (
        searchingRef.current
      ) {
        socket.emit(
          "matchmaking:cancel"
        );
      }

      if (
        !handedOffRef.current
      ) {
        client.disconnect();
      }
    };
  }, [
    client,
    onMatch
  ]);

  function cancelSearch() {
    client.socket.emit(
      "matchmaking:cancel",
      {},
      () => {}
    );

    setReadyCheck(null);
    setReadySubmitting(false);
    updateSearching(false);
    setError("");
  }

  async function findRandomMatch() {
    const deck = currentDeck();

    if (!deck) {
      setError("Escolha um deck.");
      return;
    }

    if (!deckIsValid(deck, deckValidationOptionsForSettings({ ruleset: "eternal" }))) {
      setError("Este deck precisa estar válido no formato Eternal.");
      return;
    }

    if (status !== "conectado") {
      setError("Aguarde a conexão Online.");
      return;
    }

    setError("");
    setReadyCheck(null);
    updateSearching(true, "Procurando outro jogador...");

    client.socket.emit(
      "matchmaking:join",
      {
        profile: await currentOnlineProfile(),
        deck: deck.cards,
        deckId: deck.id || null,
        deckName: deck.name || "Deck",
        coverCardId: deck.coverCardId || deck.coverId || deck.cover?.cardId || deck.cover?.id || getDeckCoverCard(deck)?.id || null
      },
      (result) => {
        if (!result?.ok) {
          updateSearching(false);
          setError(onlineErrorMessage(result, { language: ___bsJapanese() ? "ja" : "ptBR", fallback: "Não foi possível iniciar a busca." }));
          return;
        }
        if (result?.readyCheck) setReadyCheck(result.readyCheck);
      }
    );
  }

  function confirmReady() {
    if (!readyCheck?.readyCheckId || readyCheck.playerReady || readySubmitting) return;
    setReadySubmitting(true);
    client.socket.emit(
      "matchmaking:ready",
      { readyCheckId: readyCheck.readyCheckId },
      (result) => {
        setReadySubmitting(false);
        if (!result?.ok) {
          setReadyCheck(null);
          updateSearching(false);
          setError(onlineErrorMessage(result, { language: ___bsJapanese() ? "ja" : "ptBR", fallback: "A confirmação da partida expirou." }));
          return;
        }
        if (result?.readyCheck) {
          setReadyCheck((current) => ({ ...(current || {}), ...result.readyCheck }));
        }
      }
    );
  }

  async function sendFriendChallenge(entry) {
    const deck = currentDeck();
    if (!deck || !entry?.id || outgoingChallengeId || challengeBusy) return;
    if (!accountAccessToken) {
      setError("Entre na sua conta para desafiar amigos.");
      return;
    }
    if (!deckIsValid(deck, deckValidationOptionsForSettings({ ruleset: "eternal" }))) {
      setError("Este deck precisa estar válido no formato Eternal.");
      return;
    }
    setChallengeBusy(true);
    setError("");
    client.socket.emit("challenge:send", {
      targetSocketId: entry.id,
      profile: await currentOnlineProfile(),
      deck: deck.cards,
      deckId: deck.id || null,
      deckName: deck.name || "Deck",
      coverCardId: deck.coverCardId || deck.coverId || deck.cover?.cardId || deck.cover?.id || getDeckCoverCard(deck)?.id || null
    }, (result) => {
      setChallengeBusy(false);
      if (!result?.ok) {
        setError(onlineErrorMessage(result, { language: ___bsJapanese() ? "ja" : "ptBR", fallback: "Não foi possível enviar o desafio." }));
        return;
      }
      if (result?.challenge?.challengeId) setOutgoingChallengeId(result.challenge.challengeId);
    });
  }

  async function acceptFriendChallenge() {
    const deck = currentDeck();
    if (!incomingChallenge?.challengeId || !deck || challengeBusy) return;
    setChallengeBusy(true);
    setError("");
    client.socket.emit("challenge:accept", {
      challengeId: incomingChallenge.challengeId,
      profile: await currentOnlineProfile(),
      deck: deck.cards,
      deckId: deck.id || null,
      deckName: deck.name || "Deck",
      coverCardId: deck.coverCardId || deck.coverId || deck.cover?.cardId || deck.cover?.id || getDeckCoverCard(deck)?.id || null
    }, (result) => {
      setChallengeBusy(false);
      if (!result?.ok) {
        if (["CHALLENGE_EXPIRED", "FRIEND_REQUIRED", "CHALLENGE_UNAVAILABLE"].includes(result?.code)) {
          setIncomingChallenge(null);
        }
        setError(onlineErrorMessage(result, { language: ___bsJapanese() ? "ja" : "ptBR", fallback: "Não foi possível aceitar o desafio." }));
      }
    });
  }

  function declineFriendChallenge() {
    if (!incomingChallenge?.challengeId || challengeBusy) return;
    setChallengeBusy(true);
    client.socket.emit("challenge:decline", { challengeId: incomingChallenge.challengeId }, () => {
      setChallengeBusy(false);
      setIncomingChallenge(null);
    });
  }

  async function createRoom() {
    const deck =
      currentDeck();

    if (!deck) {
      setError(
        "Escolha um deck."
      );

      return;
    }

    if (
      searchingRef.current
    ) {
      cancelSearch();
    }

    setError("");

    client.createRoom(
      {
        profile:
          await currentOnlineProfile(),

        deck:
          deck.cards,
        deckId: deck.id || null,
        deckName: deck.name || "Deck",
        coverCardId: deck.coverCardId || deck.coverId || deck.cover?.cardId || deck.cover?.id || getDeckCoverCard(deck)?.id || null,

        settings: {
          title: roomTitle,
          visibility: roomVisibility,
          password: roomPassword,
          spectatorsAllowed,
          firstPlayerMode,
          turnTimerSeconds,
          mulliganEnabled,
          ruleset: roomRuleset
        }
      },
      (result) => {
        if (
          result?.ok
        ) {
          setRoom(
            result.state
          );
        } else {
          setError(
            onlineErrorMessage(result, { language: ___bsJapanese() ? "ja" : "ptBR", fallback: "Não foi possível criar a sala." })
          );
        }
      }
    );
  }

  async function joinRoom() {
    const deck =
      currentDeck();

    if (!deck) {
      setError(
        "Escolha um deck."
      );

      return;
    }

    const code =
      joinCode
        .trim()
        .toUpperCase();

    if (!code) {
      setError(
        "Digite o código da sala."
      );

      return;
    }

    if (
      searchingRef.current
    ) {
      cancelSearch();
    }

    setError("");

    client.joinRoom(
      {
        code,

        profile:
          await currentOnlineProfile(),

        deck:
          deck.cards,
        deckId: deck.id || null,
        deckName: deck.name || "Deck",
        coverCardId: deck.coverCardId || deck.coverId || deck.cover?.cardId || deck.cover?.id || getDeckCoverCard(deck)?.id || null,

        password:
          joinPassword
      },
      (result) => {
        if (
          result?.ok
        ) {
          setRoom(
            result.state
          );
          setJoinPassword("");
        } else {
          setError(
            onlineErrorMessage(result, { language: ___bsJapanese() ? "ja" : "ptBR", fallback: "Não foi possível entrar na sala." })
          );
        }
      }
    );
  }

  function start() {
    client.startRoom(
      {},
      (result) => {
        if (
          !result?.ok
        ) {
          setError(
            onlineErrorMessage(result, { language: ___bsJapanese() ? "ja" : "ptBR", fallback: "Não foi possível iniciar a partida." })
          );
        }
      }
    );
  }

  const selectedDeck = decks.find((deck) => deck.id === deckId) || null;
  const viewerId = room?.viewerPlayerId || null;
  const ownRoomPlayer = viewerId ? room?.players?.[viewerId] : null;
  const opponentId = viewerId === "player1" ? "player2" : viewerId === "player2" ? "player1" : null;
  const opponentRoomPlayer = opponentId ? room?.players?.[opponentId] : null;
  const ownName = ownRoomPlayer?.profile?.name || profile?.displayName || profile?.name || "Jogador";
  const readyOpponentProfile = readyCheck?.opponentProfile || null;
  const opponentName = readyOpponentProfile?.name || (searching
    ? "PROCURANDO..."
    : opponentRoomPlayer?.profile?.name || (room ? "AGUARDANDO..." : "AGUARDANDO OPONENTE"));
  const opponentConnected = Boolean(opponentRoomPlayer?.connected);

  function copyRoomCode() {
    if (!room?.code) return;
    try { navigator.clipboard?.writeText(room.code); } catch {}
    setSearchMessage(`Código ${room.code} copiado.`);
  }

  function refreshLobby() {
    client.socket.emit("lobby:list", {}, (result) => {
      if (result?.snapshot) setLobbySnapshot(result.snapshot);
    });
  }

  function choosePublicRoom(entry) {
    if (!entry?.code) return;
    setJoinCode(entry.code);
    setJoinPassword("");
    setPanelMode("join");
    setError("");
  }

  const visibleRooms = (lobbySnapshot.rooms || []).filter((entry) => {
    if (roomFilter === "all") return true;
    return !entry.started && Number(entry.players || 0) < Number(entry.capacity || 2);
  });

  const normalMenu = (() => {
    if (preMatch) {
      return (
        <MatchSetupMenu
          eyebrow={___bsJa("MULTIPLAYER ONLINE", "マルチプレイヤーオンライン")}
          titleTop="BATALHA"
          titleBottom="CONFIRMADA"
          status="Decks bloqueados no servidor"
          badge="VS"
        >
          <MatchMenuButton label={___bsJa("Preparando Arena", "アリーナの準備中")} detail="A partida começará automaticamente" active disabled />
        </MatchSetupMenu>
      );
    }

    if (room) {
      const isHost = room.viewerPlayerId === "player1";
      return (
        <MatchSetupMenu
          eyebrow={___bsJa("MULTIPLAYER ONLINE", "マルチプレイヤーオンライン")}
          titleTop="PARTIDA"
          titleBottom="NORMAL"
          status={`${room.settings?.title || `SALA ${room.code}`} · ${status.toUpperCase()}`}
          badge={room.settings?.visibility === "public" ? "PUBLIC" : "PRIVATE"}
        >
          <div className="online-custom-summary">
            <span><b>{___bsJa("Início", "始める")}</b>{room.settings?.firstPlayerMode === "host" ? ___bsJa("Host", "ホスト") : room.settings?.firstPlayerMode === "guest" ? ___bsJa("Convidado", "ゲスト") : ___bsJa("Aleatório", "ランダム")}</span>
            <span><b>{___bsJa("Turno", "ターン")}</b>{room.settings?.turnTimerSeconds ? `${room.settings.turnTimerSeconds}s` : ___bsJa("Sem limite", "制限なし")}</span>
            <span><b>{___bsJa("Mulligan", "マリガン")}</b>{room.settings?.mulliganEnabled === false ? ___bsJa("Desativado", "無効") : ___bsJa("Ativo", "アクティブ")}</span>
            <span><b>{___bsJa("Regras", "ルール")}</b>{room.settings?.ruleset === "lab" ? ___bsJa("LAB", "ラボ") : room.settings?.ruleset === "official" ? ___bsJa("Eternal Oficial", "エターナル・公式ルール") : ___bsJa("Eternal", "エターナル")}</span>
          </div>
          {isHost && !room.started && (
            <MatchMenuButton
              label={___bsJa("Iniciar partida", "ゲームを開始する")}
              detail={room.players?.player2 ? "Os dois jogadores estão prontos" : "Aguardando o segundo jogador"}
              active={Boolean(room.players?.player2)}
              disabled={!room.players?.player2}
              onClick={start}
            />
          )}
          {!isHost && (
            <MatchMenuButton
              label={___bsJa("Aguardando host", "ホストを待っています")}
              detail="O criador da sala inicia a partida"
              active
              disabled
            />
          )}
          <MatchMenuButton label={(___bsJapanese() ? `コード: ${room.code}` : `Código: ${room.code}`)} detail="Copiar código da sala" onClick={copyRoomCode} />
          <MatchMenuButton label={___bsJa("Voltar", "戻る")} detail="Sair desta tela e desconectar" onClick={onBack} />
        </MatchSetupMenu>
      );
    }

    if (readyCheck) {
      return (
        <MatchSetupMenu
          eyebrow={___bsJa("MULTIPLAYER ONLINE", "マルチプレイヤーオンライン")}
          titleTop="PARTIDA"
          titleBottom="ENCONTRADA"
          status="Confirme antes do tempo acabar"
          badge="READY CHECK"
        >
          <ReadyCheck
            readyCheck={readyCheck}
            submitting={readySubmitting}
            onReady={confirmReady}
            onCancel={cancelSearch}
          />
        </MatchSetupMenu>
      );
    }

    if (searching) {
      return (
        <MatchSetupMenu
          eyebrow={___bsJa("MULTIPLAYER ONLINE", "マルチプレイヤーオンライン")}
          titleTop="PARTIDA"
          titleBottom="NORMAL"
          status={___bsJapanese() ? japaneseMatchSetupText(searchMessage || "Procurando adversário...") : (searchMessage || "Procurando adversário...")}
          badge={status.toUpperCase()}
        >
          <QueueStatus message={(___bsJapanese() ? japaneseMatchSetupText(searchMessage) : searchMessage) || ___bsJa("Procurando adversário...", "対戦相手を探しています...")} onCancel={cancelSearch} />
        </MatchSetupMenu>
      );
    }

    if (panelMode === "create") {
      return (
        <MatchSetupMenu
          eyebrow={___bsJa("MULTIPLAYER ONLINE", "マルチプレイヤーオンライン")}
          titleTop="CRIAR"
          titleBottom="SALA"
          status={`ONLINE · ${status.toUpperCase()}`}
          badge={roomVisibility === "public" ? "PUBLIC" : "PRIVATE"}
        >
          <div className="online-lobby2-form">
            <label>
              <span>{___bsJa("Nome da sala", "部屋名")}</span>
              <input value={roomTitle} maxLength={48} onChange={(event) => setRoomTitle(event.target.value)} placeholder={___bsJa("Minha sala", "私の部屋")} />
            </label>
            <label>
              <span>{___bsJa("Visibilidade", "公開設定")}</span>
              <select value={roomVisibility} onChange={(event) => setRoomVisibility(event.target.value)}>
                <option value="public">{___bsJa("Pública · aparece no lobby", "公開・ロビーに表示")}</option>
                <option value="private">{___bsJa("Privada · somente por código", "非公開・コードのみ")}</option>
              </select>
            </label>
            <label>
              <span>{___bsJa("Senha opcional", "パスワード（任意）")}</span>
              <input type="password" value={roomPassword} maxLength={64} onChange={(event) => setRoomPassword(event.target.value)} placeholder={___bsJa("Sem senha", "パスワードなし")} />
            </label>
            <div className="online-custom-settings">
              <div className="online-custom-settings-heading">
                <span>{___bsJa("CONFIGURAÇÕES DA PARTIDA", "マッチ設定")}</span>
                <small>{___bsJa("Somente Online Normal · Ranked ignora estas opções", "通常のオンライン対戦のみ対象です。ランク戦では適用されません。")}</small>
              </div>
              <label>
                <span>{___bsJa("Primeiro jogador", "最初のプレイヤー")}</span>
                <select value={firstPlayerMode} onChange={(event) => setFirstPlayerMode(event.target.value)}>
                  <option value="random">{___bsJa("Aleatório a cada partida", "試合ごとにランダム")}</option>
                  <option value="host">{___bsJa("Host começa", "ホストが始まります")}</option>
                  <option value="guest">{___bsJa("Convidado começa", "ゲストが始まります")}</option>
                </select>
              </label>
              <label>
                <span>{___bsJa("Tempo por turno", "1ターンの制限時間")}</span>
                <select value={turnTimerSeconds} onChange={(event) => setTurnTimerSeconds(Number(event.target.value))}>
                  <option value={0}>{___bsJa("Sem limite", "制限なし")}</option>
                  <option value={60}>{___bsJa("60 segundos", "60秒")}</option>
                  <option value={90}>{___bsJa("90 segundos", "90秒")}</option>
                  <option value={120}>{___bsJa("120 segundos", "120秒")}</option>
                  <option value={180}>{___bsJa("180 segundos", "180秒")}</option>
                </select>
              </label>
              <label>
                <span>{___bsJa("Regras do deck", "デッキルール")}</span>
                <select value={roomRuleset} onChange={(event) => setRoomRuleset(event.target.value)}>
                  <option value="eternal">{___bsJa("Eternal · partida casual", "エターナル・カジュアルマッチ")}</option>
                  <option value="official">{___bsJa("Eternal · regulamento oficial", "エターナル・公式ルール")}</option>
                  <option value="lab">{___bsJa("LAB · teste de decks", "LAB · デッキをテストする")}</option>
                </select>
                {roomRuleset === "official" && <small className="online-custom-warning">{___bsJa("Usa a lista oficial de cartas proibidas e limitadas vigente.", "禁止および制限されたカードの現在の公式リストを使用してください。")}</small>}
                {roomRuleset === "lab" && <small className="online-custom-warning">{___bsJa("LAB permite decks a partir de 1 carta e até 99 cópias pelo mesmo nome. Use apenas para testes.", "LAB では、1 枚のカードから始まり、同じ名前のコピーが 99 枚までのデッキが許可されます。テストのみに使用してください。")}</small>}
              </label>
              <label className="online-lobby2-check">
                <input type="checkbox" checked={mulliganEnabled} onChange={(event) => setMulliganEnabled(event.target.checked)} />
                <span>{___bsJa("Permitir Mulligan no início da partida", "試合開始時にマリガンを許可する")}</span>
              </label>
            </div>
            <label className="online-lobby2-check">
              <input type="checkbox" checked={spectatorsAllowed} onChange={(event) => setSpectatorsAllowed(event.target.checked)} />
              <span>{___bsJa("Permitir espectadores quando o modo estiver disponível", "モードが利用可能な場合に閲覧者を許可する")}</span>
            </label>
          </div>
          <MatchMenuButton label={___bsJa("Criar sala", "ルームを作成する")} detail={roomVisibility === "public" ? "Publicar no Lobby Online" : "Gerar código privado"} active disabled={status !== "conectado" || !selectedDeck || !deckIsValid(selectedDeck, deckValidationOptionsForSettings({ ruleset: roomRuleset }))} onClick={createRoom} />
          <MatchMenuButton label={___bsJa("Voltar", "戻る")} onClick={() => setPanelMode("root")} />
        </MatchSetupMenu>
      );
    }

    if (panelMode === "join") {
      return (
        <MatchSetupMenu
          eyebrow={___bsJa("MULTIPLAYER ONLINE", "マルチプレイヤーオンライン")}
          titleTop="ENTRAR EM"
          titleBottom="SALA"
          status={`ONLINE · ${status.toUpperCase()}`}
        >
          <div className="online-lobby2-form">
            <label>
              <span>{___bsJa("Código da sala", "ルームコード")}</span>
              <input
                autoFocus
                placeholder="ABC123"
                value={joinCode}
                maxLength={6}
                onChange={(event) => setJoinCode(event.target.value.toUpperCase())}
                onKeyDown={(event) => { if (event.key === "Enter") joinRoom(); }}
              />
            </label>
            <label>
              <span>{___bsJa("Senha, se necessária", "必要に応じてパスワード")}</span>
              <input type="password" placeholder={___bsJa("Senha da sala", "ルームパスワード")} value={joinPassword} maxLength={64} onChange={(event) => setJoinPassword(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter") joinRoom(); }} />
            </label>
          </div>
          <MatchMenuButton label={___bsJa("Entrar", "参加する")} detail="Conectar usando código da sala" active disabled={!joinCode.trim()} onClick={joinRoom} />
          <MatchMenuButton label={___bsJa("Voltar", "戻る")} onClick={() => setPanelMode("root")} />
        </MatchSetupMenu>
      );
    }

    return (
      <MatchSetupMenu
        eyebrow={___bsJa("MULTIPLAYER ONLINE", "マルチプレイヤーオンライン")}
        titleTop="TIPO DE"
        titleBottom="PARTIDA"
        status={`ONLINE · ${status.toUpperCase()}`}
        badge="NORMAL"
      >
        <MatchMenuButton
          label={___bsJa("Procurar partida", "対戦相手を探す")}
          detail="Matchmaking rápido"
          active
          disabled={status !== "conectado" || !selectedDeck || !deckIsValid(selectedDeck, deckValidationOptionsForSettings({ ruleset: "eternal" }))}
          onClick={findRandomMatch}
        />
        <MatchMenuButton label={___bsJa("Criar sala", "ルームを作成する")} detail="Pública, privada ou protegida por senha" disabled={status !== "conectado" || !selectedDeck || !deckIsValid(selectedDeck, deckValidationOptionsForSettings({ ruleset: "eternal" }))} onClick={() => setPanelMode("create")} />
        <MatchMenuButton label={___bsJa("Entrar em uma sala", "部屋に入る")} detail="Use um código de convite" disabled={status !== "conectado" || !selectedDeck || !deckIsValid(selectedDeck, deckValidationOptionsForSettings({ ruleset: "eternal" }))} onClick={() => setPanelMode("join")} />
        <MatchMenuButton label={___bsJa("Deck Builder", "デッキ構築")} onClick={onDeckBuilder} />
        <MatchMenuButton label={___bsJa("Voltar", "戻る")} onClick={onBack} />
      </MatchSetupMenu>
    );
  })();

  return (
    <>
      <MatchSetupScreen
        className="online-match-setup"
        error={error}
        footer={preMatch ? "ONLINE 1V1 · VS" : room ? `ONLINE 1V1 · SALA ${room.code}` : readyCheck ? "ONLINE 1V1 · READY CHECK" : searching ? "ONLINE 1V1 · MATCHMAKING EM ANDAMENTO" : "ONLINE 1V1 · MATCHMAKING, SALAS PRIVADAS E CÓDIGO"}
        menu={normalMenu}
      >
        {preMatch ? (
          <PreMatchVersus preMatch={preMatch} />
        ) : room || searching || readyCheck ? (
          <div className="match-setup-duel">
            <PlayerBattlePreview
              side="left"
              kicker="VOCÊ"
              name={ownName}
              avatarSrc={profile?.avatar || profile?.avatarUrl || profile?.avatar_url || profile?.photoURL || profile?.photo || null}
              bannerSrc={getDeckPortrait(selectedDeck)}
              deck={selectedDeck}
              deckName={selectedDeck?.name || "Nenhum deck"}
              deckMeta={selectedDeck ? `${deckSize(selectedDeck)} cartas · ${deckIsValid(selectedDeck) ? "pronto" : "revisar"}` : "crie um deck para jogar"}
              status={status === "conectado" ? "ONLINE" : status.toUpperCase()}
            />

            <VersusMark />

            <PlayerBattlePreview
              side="right"
              kicker={room || readyCheck ? "OPONENTE" : "MATCHMAKING"}
              name={opponentName}
              avatarSrc={opponentRoomPlayer?.profile?.avatar || readyOpponentProfile?.avatar || null}
              bannerSrc={opponentRoomPlayer || readyOpponentProfile ? "./images/card-back.webp" : null}
              deckName={opponentRoomPlayer || readyOpponentProfile ? "Deck adversário" : searching ? "Buscando jogador" : "Aguardando conexão"}
              deckMeta={opponentRoomPlayer ? (opponentConnected ? "conectado · identidade pública" : "offline") : readyOpponentProfile ? "partida encontrada · deck protegido" : "o deck será revelado apenas quando permitido"}
              status={opponentRoomPlayer ? (opponentConnected ? "CONECTADO" : "OFFLINE") : readyOpponentProfile ? (readyCheck?.opponentReady ? "PRONTO" : "CONFIRMANDO") : searching ? "BUSCANDO" : "ESPERA"}
              waiting={!opponentRoomPlayer && !readyOpponentProfile}
            />
          </div>
        ) : (
          <div className="online-lobby2-dashboard">
            <header className="online-lobby2-hero">
              <div>
                <span>{___bsJa("CUSTOM MATCH · ONLINE LOBBY", "カスタムマッチ・オンラインロビー")}</span>
                <h2>{___bsJa("ENCONTRE SUA PRÓXIMA BATALHA", "次の戦いを見つけてください")}</h2>
                <p>{___bsJa("Salas públicas, convites privados e jogadores conectados em uma única tela.", "公開ルームと接続中のプレイヤーを確認できます。")}</p>
              </div>
              <button type="button" onClick={refreshLobby}>{___bsJa("Atualizar lobby", "ロビーを更新する")}</button>
            </header>

            <div className="online-lobby2-stats">
              <article><strong>{lobbySnapshot.counts?.online || 0}</strong><span>{___bsJa("Jogadores online", "オンラインプレイヤー")}</span></article>
              <article><strong>{lobbySnapshot.counts?.available || 0}</strong><span>{___bsJa("Disponíveis", "利用可能")}</span></article>
              <article><strong>{lobbySnapshot.counts?.publicRooms || 0}</strong><span>{___bsJa("Salas públicas", "公開ルーム")}</span></article>
              <article><strong>{lobbySnapshot.counts?.activeMatches || 0}</strong><span>{___bsJa("Partidas ativas", "アクティブな試合")}</span></article>
            </div>

            <div className="online-lobby2-grid">
              <section className="online-lobby2-card rooms">
                <header>
                  <div><span>{___bsJa("SALAS", "ルーム")}</span><h3>{___bsJa("Partidas públicas", "公開試合")}</h3></div>
                  <div className="online-lobby2-tabs">
                    <button type="button" className={roomFilter === "open" ? "active" : ""} onClick={() => setRoomFilter("open")}>{___bsJa("Abertas", "募集中")}</button>
                    <button type="button" className={roomFilter === "all" ? "active" : ""} onClick={() => setRoomFilter("all")}>{___bsJa("Todas", "全て")}</button>
                  </div>
                </header>
                <div className="online-lobby2-room-list">
                  {visibleRooms.length ? visibleRooms.map((entry) => (
                    <button type="button" key={entry.code} className="online-lobby2-room" disabled={entry.started || entry.players >= entry.capacity} onClick={() => choosePublicRoom(entry)}>
                      <span className="online-lobby2-room-main">
                        <b>{entry.title}</b>
                        <small>{entry.host?.name || ___bsJa("Jogador", "プレーヤー")}{entry.host?.username ? ` · @${entry.host.username}` : ""}</small>
                      </span>
                      <span className="online-lobby2-room-tags">
                        {entry.locked && <em>{___bsJa("LOCK", "ロック")}</em>}
                        {entry.spectatorsAllowed && <em>{___bsJa("WATCH", "観戦")}</em>}
                        {entry.custom?.turnTimerSeconds > 0 && <em>{entry.custom.turnTimerSeconds}s</em>}
                        {entry.custom?.ruleset === "official" && <em>{___bsJa("OFICIAL", "正式")}</em>}
                        {entry.custom?.ruleset === "lab" && <em>{___bsJa("LAB", "ラボ")}</em>}
                        {entry.custom?.firstPlayerMode !== "random" && <em>{entry.custom.firstPlayerMode === "host" ? ___bsJa("HOST 1ST", "ホストが先攻") : ___bsJa("GUEST 1ST", "ゲストが先攻")}</em>}
                        <em>{entry.started ? ___bsJa("EM JOGO", "遊び中") : `${entry.players}/${entry.capacity}`}</em>
                      </span>
                      <i>{entry.code}</i>
                    </button>
                  )) : (
                    <div className="online-lobby2-empty">{___bsJa("Nenhuma sala pública aberta agora. Você pode criar a primeira.", "募集中の公開ルームはありません。")}</div>
                  )}
                </div>
              </section>

              <section className="online-lobby2-card players">
                <header><div><span>{___bsJa("PRESENÇA", "プレイヤー")}</span><h3>{___bsJa("Jogadores conectados", "接続中のプレイヤー")}</h3></div></header>
                <div className="online-lobby2-player-list">
                  {(lobbySnapshot.players || []).slice(0, 12).map((entry) => (
                    <div className="online-lobby2-player" key={entry.id}>
                      <div className="online-lobby2-avatar">
                        {entry.profile?.avatar ? <img src={entry.profile.avatar} alt="" /> : <span>{String(entry.profile?.name || "P").slice(0, 1).toUpperCase()}</span>}
                      </div>
                      <span><b>{entry.profile?.name || ___bsJa("Jogador", "プレーヤー")}</b><small>{entry.profile?.username ? `@${entry.profile.username}` : ___bsJa("Jogador Online", "オンラインプレイヤー")}</small></span>
                      <div className="online-lobby2-player-actions">
                        {isFriendLobbyPlayer(entry) && entry.status === "available" && String(entry.profile?.username || "").toLowerCase() !== String(profile?.username || "").toLowerCase() && (
                          <button type="button" disabled={challengeBusy || Boolean(outgoingChallengeId)} onClick={() => sendFriendChallenge(entry)}>
                            {outgoingChallengeId ? ___bsJa("AGUARDANDO", "待っている") : ___bsJa("DESAFIAR", "チャレンジ")}
                          </button>
                        )}
                        <em className={`status-${entry.status}`}>{entry.status === "available" ? ___bsJa("DISPONÍVEL", "利用可能") : entry.status === "searching" ? ___bsJa("BUSCANDO", "検索中") : entry.status === "in_room" ? ___bsJa("EM SALA", "ルーム内") : entry.status === "in_match" ? ___bsJa("EM PARTIDA", "対戦中") : ___bsJa("RANKED", "ランク対戦")}</em>
                      </div>
                    </div>
                  ))}
                  {!(lobbySnapshot.players || []).length && <div className="online-lobby2-empty">{___bsJa("Conectando à presença do lobby...", "ロビーへの接続を待っています…")}</div>}
                </div>
              </section>
            </div>

            <footer className="online-lobby2-deck">
              <div>
                <span>{___bsJa("DECK ATUAL", "現在のデッキ")}</span>
                <strong>{selectedDeck?.name || ___bsJa("Nenhum deck selecionado", "デッキが選択されていません")}</strong>
                <small>{selectedDeck ? (___bsJapanese() ? `${deckSize(selectedDeck)}枚 · ${deckIsValid(selectedDeck) ? "使用可能" : "要確認"}` : `${deckSize(selectedDeck)} cartas · ${deckIsValid(selectedDeck) ? "PRONTO" : "REVISAR"}`) : ___bsJa("Selecione um deck antes de jogar", "プレイする前にデッキを選択してください")}</small>
              </div>
              <button type="button" disabled={!decks.length} onClick={() => setDeckPickerOpen(true)}>{___bsJa("Trocar deck", "デッキを変更")}</button>
            </footer>
          </div>
        )}
      </MatchSetupScreen>

      <FriendChallengePrompt
        challenge={incomingChallenge}
        busy={challengeBusy}
        onAccept={acceptFriendChallenge}
        onDecline={declineFriendChallenge}
      />

      <DeckPicker
        open={deckPickerOpen}
        title={___bsJa("DECK PARA O ONLINE", "オンライン用のデッキ")}
        decks={decks}
        selectedId={deckId}
        onSelect={setDeckId}
        onClose={() => setDeckPickerOpen(false)}
        onDeckBuilder={onDeckBuilder}
      />
    </>
  );
}
