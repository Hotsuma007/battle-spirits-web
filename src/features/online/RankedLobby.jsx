import { japaneseText as ___bsJa } from "../../localization/displayLanguage.js";
import { useEffect, useMemo, useRef, useState } from "react";
import { getDecks, getProfile, getSettings } from "../../services/platform/storage.js";
import { createOnlinePublicProfile } from "../../online/publicProfile.js";
import { createOnlineClient } from "../../online/socketClient.js";
import { ONLINE_SERVER_URL } from "../../app/config/online.js";
import { loadRankedHistory, loadRankedProfile } from "../../services/player/rankedService.js";
import { useLanguage } from "../../localization/i18n.jsx";
import { onlineConnectionErrorMessage, onlineErrorMessage } from "../../online/errors/onlineErrorMessages.js";
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
} from "../match-setup/components/MatchSetupScreen.jsx";
import "../../styles/pages/rankedV400.css";

function rankTheme(rank) {
  const value = String(rank || "").toLowerCase();
  if (value.includes("master")) return "master";
  if (value.includes("diamond")) return "diamond";
  if (value.includes("platinum") || value.includes("platina")) return "platinum";
  if (value.includes("gold") || value.includes("ouro")) return "gold";
  if (value.includes("silver") || value.includes("prata")) return "silver";
  return "bronze";
}

function formatMatchDate(value, locale) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat(locale, { day: "2-digit", month: "2-digit" }).format(date);
}

export default function RankedLobby({ onBack, onAccount, onDeckBuilder, onMatch }) {
  const { language } = useLanguage();
  const pt = language !== "en";
  const locale = pt ? "pt-BR" : "en-US";
  const decks = useMemo(() => getDecks(), []);
  const profile = useMemo(() => getProfile() || {}, []);
  const settings = useMemo(() => getSettings() || {}, []);
  const [deckId, setDeckId] = useState(decks[0]?.id || "");
  const [pickerOpen, setPickerOpen] = useState(false);
  const [status, setStatus] = useState("connecting");
  const [searching, setSearching] = useState(false);
  const [searchMessage, setSearchMessage] = useState("");
  const [error, setError] = useState("");
  const [ranked, setRanked] = useState(null);
  const [history, setHistory] = useState([]);
  const [accessToken, setAccessToken] = useState(null);
  const handedOffRef = useRef(false);
  const searchingRef = useRef(false);
  const client = useMemo(() => createOnlineClient(ONLINE_SERVER_URL), []);

  const deck = decks.find((item) => item.id === deckId) || null;
  const validDeck = deckIsValid(deck, { regulation: "official" });
  const playerName = profile.displayName || profile.name || (language === "ja" ? "プレイヤー" : pt ? "Jogador" : "Player");
  const rankLabel = ranked?.rank?.label || "BRONZE III";
  const rp = Number(ranked?.rp ?? 1000);
  const rankClass = rankTheme(rankLabel);

  useEffect(() => {
    let active = true;
    Promise.all([loadRankedProfile(), loadRankedHistory({ limit: 8 })]).then(([profileResult, historyResult]) => {
      if (!active) return;
      if (profileResult.ok) {
        setRanked(profileResult.profile);
        setAccessToken(profileResult.accessToken);
      } else {
        setError(language === "ja" ? "現在、ランク戦を利用できません。" : pt ? "Ranked indisponível no momento." : "Ranked is unavailable right now.");
      }
      if (historyResult.ok) setHistory(historyResult.rows || []);
    });
    return () => { active = false; };
  }, [pt]);

  useEffect(() => {
    const socket = client.socket;
    const onConnect = () => setStatus("connected");
    const onDisconnect = () => setStatus("disconnected");
    const onConnectError = (err) => {
      setStatus("error");
      console.error("Falha ao conectar ao Ranked:", err);
      setError(onlineConnectionErrorMessage(language));
    };
    const onStatus = (payload) => {
      if (payload?.status === "searching") {
        searchingRef.current = true;
        setSearching(true);
        setSearchMessage(
          language === "ja" ? `${payload.rank || rankLabel}・${payload.rp ?? rp} RP 付近の対戦相手を探しています…` : pt
            ? `Buscando adversário próximo de ${payload.rank || rankLabel} · ${payload.rp ?? rp} RP...`
            : `Searching near ${payload.rank || rankLabel} · ${payload.rp ?? rp} RP...`
        );
      }
    };
    const onMatched = (payload) => {
      client.adoptSession?.(payload);
      setSearchMessage(language === "ja" ? "対戦相手が見つかりました。対戦の準備中です…" : pt ? "Adversário encontrado. Preparando duelo..." : "Opponent found. Preparing duel...");
    };
    const onState = (state) => {
      if (!state?.started || !state?.match || !state?.ranked) return;
      handedOffRef.current = true;
      searchingRef.current = false;
      setSearching(false);
      onMatch({ match: state.match, onlineClient: client, roomState: state, viewerPlayerId: state.viewerPlayerId });
    };
    const onResult = (payload) => {
      if (!payload) return;
      setRanked((current) => current
        ? { ...current, rp: payload.rpAfter, rank: { ...(current.rank || {}), label: payload.rank } }
        : current);
    };

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);
    socket.on("connect_error", onConnectError);
    socket.on("ranked:status", onStatus);
    socket.on("ranked:matched", onMatched);
    socket.on("ranked:result", onResult);
    socket.on("room:state", onState);
    client.connect();

    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
      socket.off("connect_error", onConnectError);
      socket.off("ranked:status", onStatus);
      socket.off("ranked:matched", onMatched);
      socket.off("ranked:result", onResult);
      socket.off("room:state", onState);
      if (searchingRef.current) socket.emit("ranked:cancel");
      if (!handedOffRef.current) client.disconnect();
    };
  }, [client, onMatch, pt, rankLabel, rp]);

  async function findRankedMatch() {
    if (!accessToken) {
      setError(language === "ja" ? "ランク戦にはログインしてください。" : pt
        ? "Entre na sua conta para acessar o Ranked."
        : "Sign in to your account to access Ranked.");
      return;
    }
    if (!deck) return setError(language === "ja" ? "デッキを選択してください。" : pt ? "Escolha um deck." : "Choose a deck.");
    if (!validDeck) return setError(language === "ja" ? "選択したデッキはランク戦で使用できません。" : pt ? "O deck selecionado não está apto ao Ranked." : "The selected deck is not eligible for Ranked.");
    if (status !== "connected") return setError(language === "ja" ? "ランク戦への接続をお待ちください。" : pt ? "Aguarde a conexão com o Ranked." : "Wait for the Ranked connection.");

    setError("");
    searchingRef.current = true;
    setSearching(true);
    setSearchMessage(language === "ja" ? "ランク戦の待機列に参加しています…" : pt ? "Entrando na fila competitiva..." : "Joining the competitive queue...");
    const playerColor = settings.onlinePlayerColor || settings.preferredPlayerColor || "#d8d8d8";
    const publicProfile = await createOnlinePublicProfile(profile, playerColor);

    client.socket.emit("ranked:join", {
      accessToken,
      profile: publicProfile,
      deck: deck.cards,
      deckId: deck.id || null,
      deckName: deck.name || "Deck"
    }, (result) => {
      if (!result?.ok) {
        searchingRef.current = false;
        setSearching(false);
        setError(onlineErrorMessage(result, { language, fallback: language === "ja" ? "ランク戦の待機列に参加できませんでした。" : pt ? "Não foi possível entrar na fila Ranked." : "Could not join the Ranked queue." }));
        return;
      }
      if (result.status === "searching") {
        setSearchMessage(
          language === "ja" ? `対戦相手を検索中・${result.rank || rankLabel}・${result.rp ?? rp} RP` : pt
            ? `Buscando adversário · ${result.rank || rankLabel} · ${result.rp ?? rp} RP`
            : `Searching for opponent · ${result.rank || rankLabel} · ${result.rp ?? rp} RP`
        );
      }
    });
  }

  function cancelSearch() {
    client.socket.emit("ranked:cancel", {}, () => {});
    searchingRef.current = false;
    setSearching(false);
    setSearchMessage("");
  }

  const totalMatches = Number(ranked?.wins || 0) + Number(ranked?.losses || 0);
  const winRate = totalMatches ? Math.round((Number(ranked?.wins || 0) / totalMatches) * 100) : 0;
  const peakRp = Number(ranked?.peak_rp ?? rp);
  const connectionLabel = status === "connected"
    ? (language === "ja" ? "接続済み" : pt ? "Conectado" : "Connected")
    : status === "connecting"
      ? (language === "ja" ? "接続中" : pt ? "Conectando" : "Connecting")
      : (language === "ja" ? "オフライン" : pt ? "Offline" : "Offline");
  const readyToQueue = Boolean(accessToken && validDeck && status === "connected");

  return (
    <>
      <MatchSetupScreen
        className="ranked-match-setup ranked-v400"
        error={error}
        footer={language === "ja" ? "ランク戦・シーズン0 / プレシーズン" : pt ? "RANKED · SEASON 0 / PRÉ-TEMPORADA" : "RANKED · SEASON 0 / PRE-SEASON"}
        menu={
          <MatchSetupMenu
            eyebrow={pt ? ___bsJa("MULTIPLAYER ONLINE", "オンラインマルチプレイヤー") : ___bsJa("ONLINE MULTIPLAYER", "オンラインマルチプレイヤー")}
            titleTop={language === "ja" ? "ランク戦" : pt ? "PARTIDA" : "RANKED"}
            titleBottom={language === "ja" ? "対戦" : pt ? "RANQUEADA" : "MATCH"}
            status={`${rankLabel} · ${rp} RP`}
            badge={language === "ja" ? "シーズン0" : "SEASON 0"}
          >
            <MatchMenuButton
              label={searching ? (pt ? ___bsJa("Cancelar busca", "検索をキャンセルする") : ___bsJa("Cancel search", "検索をキャンセルする")) : (pt ? ___bsJa("Buscar partida", "対戦相手を探す") : ___bsJa("Find match", "対戦相手を探す"))}
              detail={searching
                ? (searchMessage || (language === "ja" ? "対戦相手を探しています…" : pt ? "Procurando adversário..." : "Searching for opponent..."))
                : readyToQueue
                  ? (language === "ja" ? "待機列に参加できます" : pt ? "Pronto para entrar na fila" : "Ready to join the queue")
                  : (language === "ja" ? "以下の条件を確認してください" : pt ? "Revise os requisitos abaixo" : "Check the requirements below")}
              active
              disabled={!readyToQueue && !searching}
              onClick={searching ? cancelSearch : findRankedMatch}
            />
            {!accessToken && (
              <MatchMenuButton
                label={pt ? ___bsJa("Entrar na conta", "サインイン") : ___bsJa("Sign in", "サインイン")}
                detail={language === "ja" ? "ランク戦にはログインが必要です" : pt ? "Conta necessária para jogar Ranked" : "An account is required for Ranked"}
                onClick={onAccount}
              />
            )}
            <MatchMenuButton
              label={pt ? ___bsJa("Deck ranqueado", "ランク戦のデッキ") : ___bsJa("Ranked deck", "ランク戦のデッキ")}
              detail={deck
                ? `${deck.name} · ${deckSize(deck)} ${language === "ja" ? "枚" : pt ? "cartas" : "cards"} · ${validDeck ? (language === "ja" ? "使用可能" : pt ? "apto" : "eligible") : (language === "ja" ? "要確認" : pt ? "revisar" : "review")}`
                : (language === "ja" ? "デッキを選択" : pt ? "Selecionar deck" : "Select deck")}
              onClick={() => setPickerOpen(true)}
            />
            {!validDeck && deck && (
              <MatchMenuButton
                label={pt ? ___bsJa("Corrigir deck", "デッキを修正する") : ___bsJa("Fix deck", "デッキを修正する")}
                detail={language === "ja" ? "デッキ編集画面を開く" : pt ? "Abrir no Deck Builder" : "Open in Deck Builder"}
                onClick={onDeckBuilder}
              />
            )}
            <MatchMenuButton label={pt ? ___bsJa("Voltar", "戻る") : ___bsJa("Back", "戻る")} onClick={onBack} />
          </MatchSetupMenu>
        }
      >
        <div className="ranked-v400-content">
          <section className={`ranked-v400-header rank-${rankClass}`} aria-label={pt ? ___bsJa("Resumo competitivo", "ランク戦の成績") : ___bsJa("Competitive summary", "ランク戦の成績")}>
            <div className="ranked-v400-season-copy">
              <span>{___bsJa("SEASON 0", "シーズン0")}</span>
              <strong>{rankLabel}</strong>
              <small>{pt ? ___bsJa("Pré-temporada competitiva", "ランク戦プレシーズン") : ___bsJa("Competitive pre-season", "ランク戦プレシーズン")}</small>
            </div>
            <div className="ranked-v400-rp">
              <strong>{rp}</strong>
              <span>RP</span>
            </div>
            <div className={`ranked-v400-connection is-${status}`}>
              <i aria-hidden="true" />
              <span>{connectionLabel}</span>
            </div>
          </section>

          <div className="match-setup-duel ranked-duel-grid">
            <PlayerBattlePreview
              side="left"
              kicker={language === "ja" ? "自分のプロフィール" : pt ? "SEU PERFIL" : "YOUR PROFILE"}
              name={playerName}
              rank={`${rankLabel} · ${rp} RP`}
              avatarSrc={profile.avatar || profile.avatarUrl || profile.avatar_url || profile.photoURL || profile.photo || null}
              bannerSrc={getDeckPortrait(deck)}
              deck={deck}
              deckName={deck?.name || (language === "ja" ? "デッキなし" : pt ? "Nenhum deck" : "No deck")}
              deckMeta={deck
                ? `${deckSize(deck)} ${language === "ja" ? "枚" : pt ? "cartas" : "cards"} · ${validDeck ? (language === "ja" ? "ランク戦で使用可能" : pt ? "apto ao Ranked" : "Ranked eligible") : (language === "ja" ? "デッキを確認" : pt ? "revisar deck" : "review deck")}`
                : (language === "ja" ? "ランク戦のデッキを選択" : pt ? "selecione seu deck ranqueado" : "select your Ranked deck")}
              status={language === "ja" ? (accessToken ? (validDeck ? "準備完了" : "デッキを確認") : "ログイン") : (accessToken ? (validDeck ? "RANKED READY" : "REVIEW DECK") : "SIGN IN")}
            />

            <VersusMark />

            <PlayerBattlePreview
              side="right"
              kicker={language === "ja" ? "対戦相手の検索" : pt ? "MATCHMAKING" : "MATCHMAKING"}
              name={searching ? (language === "ja" ? "検索中…" : pt ? "PROCURANDO..." : "SEARCHING...") : (language === "ja" ? "対戦相手" : pt ? "ADVERSÁRIO" : "OPPONENT")}
              avatarSrc={null}
              bannerSrc={null}
              deckName={searching ? (language === "ja" ? "対戦相手を検索中" : pt ? "Fila competitiva ativa" : "Competitive queue active") : (language === "ja" ? "RPに基づく対戦相手の検索" : pt ? "Matchmaking por RP" : "RP matchmaking")}
              deckMeta={searching
                ? (language === "ja" ? "検索範囲は徐々に広がります" : pt ? "a faixa de busca aumenta gradualmente" : "search range expands gradually")
                : (language === "ja" ? "対戦相手が見つかると表示されます" : pt ? "o adversário aparece após o pareamento" : "opponent appears after matching")}
              status={searching ? (language === "ja" ? "検索中" : pt ? "EM BUSCA" : "SEARCHING") : "SEASON 0"}
              waiting
            />
          </div>

          <section className="ranked-season-panel" aria-label={pt ? ___bsJa("Estatísticas da Season 0", "シーズン0の統計") : ___bsJa("Season 0 statistics", "シーズン0の統計")}>
            <div><span>{pt ? ___bsJa("RP ATUAL", "現在のRP") : ___bsJa("CURRENT RP", "現在のRP")}</span><strong>{rp}</strong><small>{rankLabel}</small></div>
            <div><span>{pt ? ___bsJa("PICO", "ピーク") : ___bsJa("PEAK", "ピーク")}</span><strong>{peakRp}</strong><small>{___bsJa("Season 0", "シーズン0")}</small></div>
            <div><span>{pt ? ___bsJa("VITÓRIAS", "勝利") : ___bsJa("WINS", "勝利")}</span><strong>{Number(ranked?.wins || 0)}</strong><small>{language === "ja" ? `勝率 ${winRate}%` : `${winRate}% win rate`}</small></div>
            <div><span>{pt ? ___bsJa("PARTIDAS", "試合") : ___bsJa("MATCHES", "試合")}</span><strong>{totalMatches}</strong><small>{Number(ranked?.losses || 0)} {pt ? ___bsJa("derrotas", "敗北") : ___bsJa("losses", "敗北")}</small></div>
          </section>

          <section className="ranked-recent-panel">
            <header>
              <div>
                <span>{pt ? ___bsJa("HISTÓRICO RANKED", "ランク戦の履歴") : ___bsJa("RANKED HISTORY", "ランク戦の履歴")}</span>
                <strong>{pt ? ___bsJa("Últimas partidas", "最近の試合") : ___bsJa("Recent matches", "最近の試合")}</strong>
              </div>
              <small>{history.length ? `${Math.min(history.length, 5)} / ${history.length}` : ___bsJa("SEASON 0", "シーズン0")}</small>
            </header>

            {history.length > 0 ? (
              <div className="ranked-recent-list">
                {history.slice(0, 5).map((row) => {
                  const win = row.result === "win";
                  const delta = Number(row.rp_delta || 0);
                  return (
                    <article key={row.match_uid} className={win ? "win" : "loss"}>
                      <b>{win ? (pt ? ___bsJa("VITÓRIA", "勝利") : ___bsJa("WIN", "勝利")) : (pt ? ___bsJa("DERROTA", "敗北") : ___bsJa("LOSS", "敗北"))}</b>
                      <span>{row.opponent_name || (pt ? ___bsJa("Oponente", "相手") : ___bsJa("Opponent", "相手"))}</span>
                      <small>{formatMatchDate(row.created_at || row.finished_at, locale)}</small>
                      <em>{delta >= 0 ? "+" : ""}{delta} RP</em>
                    </article>
                  );
                })}
              </div>
            ) : (
              <div className="ranked-v400-empty-history">
                <strong>{pt ? ___bsJa("Sua jornada competitiva começa aqui.", "あなたの競争の旅はここから始まります。") : ___bsJa("Your competitive journey starts here.", "あなたの競争の旅はここから始まります。")}</strong>
                <span>{pt ? ___bsJa("As partidas da Season 0 aparecerão neste espaço.", "シーズン 0 の試合がここに表示されます。") : ___bsJa("Season 0 matches will appear here.", "シーズン 0 の試合がここに表示されます。")}</span>
              </div>
            )}
          </section>
        </div>
      </MatchSetupScreen>

      <DeckPicker
        open={pickerOpen}
        title={pt ? ___bsJa("Deck ranqueado", "ランク戦のデッキ") : ___bsJa("Ranked deck", "ランク戦のデッキ")}
        decks={decks}
        selectedId={deckId}
        onSelect={setDeckId}
        onClose={() => setPickerOpen(false)}
        onDeckBuilder={onDeckBuilder}
      />
    </>
  );
}
