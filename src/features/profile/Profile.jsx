import { japaneseGameError } from "../../localization/japaneseGameErrors.js";
import { japaneseText as ___bsJa, isJapaneseDisplay } from "../../localization/displayLanguage.js";
import { getCardName } from "../../game/cardAdapter.js";
import { useEffect, useMemo, useRef, useState } from "react";
import EternalCinematicBackdrop from "../../components/layout/EternalCinematicBackdrop.jsx";
import PointerTiltSurface from "../../components/layout/PointerTiltSurface.jsx";
import { cardIndex } from "../../services/cards/cardRepository.js";
import { getDecks, getProfile, saveProfile } from "../../services/platform/storage.js";
import { accountsEnabled } from "../../services/platform/supabase.js";
import {
  DEFAULT_SOCIAL_PRIVACY,
  blockUser,
  getAccountSession,
  loadDirectMessages,
  loadSocialBootstrap,
  loadSocialProfile,
  markAllNotificationsRead,
  markConversationRead,
  removeFriend,
  respondFriendRequest,
  savePrivacySettings,
  searchProfiles,
  sendTypingSignal,
  setFriendPreference,
  subscribeConversationTyping,
  sendDirectMessage,
  sendFriendRequest,
  subscribeSocialEvents,
  syncProfileToCloud,
  touchSocialPresence,
  unblockUser
} from "../../services/player/socialService.js";
import { buildPlayerSocialInsights, formatMasteryLabel } from "../../services/player/socialInsights.js";
import { loadMatchHistory, summarizeMatchHistory } from "../../services/player/matchHistoryService.js";
import { loadCardMastery, reconcileMasteryFromHistory, summarizeCardMastery } from "../../services/player/cardMasteryService.js";
import { loadFriendRankedIdentities, loadPublicRankedIdentity, loadRankedHistory, loadRankedProfile, summarizeRankedHistory } from "../../services/player/rankedService.js";
import { useLanguage } from "../../localization/i18n.jsx";
import "../../styles/pages/socialHubV360.css";
import "../../styles/pages/eternalInterfaceV350.css";


function displayColor(value, language) {
  if (!value) return "—";
  const names = { red: "赤", purple: "紫", green: "緑", white: "白", yellow: "黄", blue: "青" };
  return language === "ja" ? names[String(value).toLowerCase()] || value : String(value).toUpperCase();
}

function displayMode(value, language) {
  const names = { local: "ローカル対戦", ai: "CPU対戦", online: "オンライン対戦", ranked: "ランク対戦" };
  return language === "ja" ? names[String(value).toLowerCase()] || value : String(value).toUpperCase();
}

function getInitials(value) {
  const parts = String(value || "Player").trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return "P";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts.at(-1)[0]}`.toUpperCase();
}

function personName(person) {
  return person?.display_name || person?.displayName || person?.name || person?.username || "Jogador";
}

function personId(person) {
  return person?.friend_id || person?.user_id || person?.id || null;
}

function formatTime(value, language = "ptBR") {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const now = new Date();
  const sameDay = date.toDateString() === now.toDateString();
  const yesterday = new Date(now); yesterday.setDate(now.getDate() - 1);
  const locale = language === "ja" ? "ja-JP" : language === "en" ? "en-US" : "pt-BR";
  const clock = date.toLocaleTimeString(locale, { hour: "2-digit", minute: "2-digit" });
  if (sameDay) return language === "ja" ? `今日 ${clock}` : language === "en" ? `Today · ${clock}` : `Hoje · ${clock}`;
  if (date.toDateString() === yesterday.toDateString()) return language === "ja" ? `昨日 ${clock}` : language === "en" ? `Yesterday · ${clock}` : `Ontem · ${clock}`;
  return date.toLocaleString(locale, { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" });
}

function presenceLabel(friend, pt) {
  if (isJapaneseDisplay()) {
    if (friend?.is_online) return "オンライン";
    return ({ away: "離席中", busy: "取り込み中", hidden: "状態非公開" }[friend?.presence_status]) || "オフライン";
  }
  if (friend?.is_online) return pt ? "Online" : "Online";
  if (friend?.presence_status === "away") return pt ? "Ausente" : "Away";
  if (friend?.presence_status === "busy") return pt ? "Ocupado" : "Busy";
  if (friend?.presence_status === "hidden") return pt ? "Status oculto" : "Status hidden";
  return pt ? "Offline" : "Offline";
}

function SocialAvatar({ person, size = "normal" }) {
  const name = personName(person);
  return (
    <span className={`social-avatar ${size}`}>
      {person?.avatar ? <img src={person.avatar} alt="" /> : <b>{getInitials(name)}</b>}
    </span>
  );
}

function SocialNavButton({ icon, label, active, badge, disabled, onClick }) {
  return (
    <button
      type="button"
      className={`social-nav-button ${active ? "active" : ""}`}
      disabled={disabled}
      onClick={onClick}
    >
      <span className="social-nav-active" aria-hidden="true" />
      <i aria-hidden="true">{icon}</i>
      <b>{label}</b>
      {badge > 0 && <em>{badge > 99 ? "99+" : badge}</em>}
    </button>
  );
}

function SocialSectionTitle({ eyebrow, title, description, action }) {
  return (
    <header className="social-section-title">
      <div>
        <span>{eyebrow}</span>
        <h2>{title}</h2>
        {description && <p>{description}</p>}
      </div>
      {action}
    </header>
  );
}

function ToggleRow({ title, description, checked, onChange, disabled }) {
  return (
    <label className={`social-toggle-row ${disabled ? "disabled" : ""}`}>
      <span>
        <strong>{title}</strong>
        {description && <small>{description}</small>}
      </span>
      <input type="checkbox" checked={Boolean(checked)} onChange={(event) => onChange(event.target.checked)} disabled={disabled} />
      <i aria-hidden="true"><b /></i>
    </label>
  );
}

function PrivacySelect({ title, description, value, onChange, options, disabled }) {
  const { language } = useLanguage();
  const labels = { public: "公開", friends: "フレンドのみ", private: "非公開", everyone: "全員", mutuals: "共通のフレンド", nobody: "受け付けない" };
  return (
    <label className="social-privacy-select">
      <span>
        <strong>{title}</strong>
        {description && <small>{description}</small>}
      </span>
      <select value={value} onChange={(event) => onChange(event.target.value)} disabled={disabled}>
        {options.map((option) => <option key={option.value} value={option.value}>{language === "ja" ? labels[option.value] || option.label : option.label}</option>)}
      </select>
    </label>
  );
}

function MasteryCard({ entry, language, onClick }) {
  if (!entry) return null;
  const label = formatMasteryLabel(entry.level, language);
  const cardName = language === "ja" && cardIndex.get(entry.cardId || entry.id) ? getCardName(cardIndex.get(entry.cardId || entry.id), "ja") : entry.name;
  return (
    <PointerTiltSurface className="social-mastery-tilt" maxTilt={6} glare>
      <article className="social-mastery-card" role={onClick ? "button" : undefined} tabIndex={onClick ? 0 : undefined} onClick={() => onClick?.(entry)} onKeyDown={(event) => { if (onClick && (event.key === "Enter" || event.key === " ")) onClick(entry); }}>
        <div className="social-mastery-art">
          {entry.image ? <img src={entry.image} alt="" /> : <span>{getInitials(entry.name)}</span>}
          <div className="social-mastery-shade" />
        </div>
        <div className="social-mastery-copy">
          <span>{label}</span>
          <strong title={cardName}>{cardName}</strong>
          <small>{entry.xp ?? entry.points}{___bsJa(" XP · ", " XP・ ")}{entry.matches ?? entry.deckCount ?? 0} {language === "en" ? ___bsJa("matches", "対戦") : ___bsJa("partidas", "対戦")}</small>
        </div>
      </article>
    </PointerTiltSurface>
  );
}

function FriendDock({ friends, friendRanks = {}, pt, onChat, onManage }) {
  const sorted = [...friends].sort((a, b) => Number(Boolean(b.is_favorite)) - Number(Boolean(a.is_favorite)) || Number(Boolean(b.is_online)) - Number(Boolean(a.is_online)) || personName(a).localeCompare(personName(b)));
  const online = sorted.filter((friend) => friend.is_online).length;
  return (
    <aside className="social-friend-dock">
      <header>
        <div>
          <span>{pt ? ___bsJa("AMIGOS", "友達") : ___bsJa("FRIENDS", "友達")}</span>
          <strong>{online} {pt ? ___bsJa("online", "オンライン") : ___bsJa("online", "オンライン")}</strong>
        </div>
        <button type="button" onClick={onManage} aria-label={pt ? ___bsJa("Gerenciar amigos", "友達を管理する") : ___bsJa("Manage friends", "友達を管理する")}>＋</button>
      </header>
      <div className="social-friend-dock-list">
        {sorted.length ? sorted.map((friend) => (
          <button type="button" key={personId(friend)} className="social-friend-dock-row" onClick={() => onChat(friend)}>
            <SocialAvatar person={friend} size="small" />
            <span>
              <strong>{friend.is_favorite ? "★ " : ""}{personName(friend)} {friendRanks[personId(friend)]?.rank?.label && <em className={`social-rank-mini rank-${friendRanks[personId(friend)].rank.tier.toLowerCase()}`}>{friendRanks[personId(friend)].rank.label}</em>}</strong>
              <small>{friend.custom_status || presenceLabel(friend, pt)}</small>
            </span>
            <i className={friend.is_online ? "online" : ""} aria-hidden="true" />
            {Number(friend.unread_count || 0) > 0 && <em>{friend.unread_count}</em>}
          </button>
        )) : (
          <div className="social-friend-dock-empty">
            <b>◇</b>
            <span>{pt ? ___bsJa("Sua lista de amigos aparece aqui.", "ここに友達リストが表示されます。") : ___bsJa("Your friends list appears here.", "ここに友達リストが表示されます。")}</span>
          </div>
        )}
      </div>
      <footer>
        <span>{pt ? ___bsJa("Jogue e converse com seus amigos", "友達と遊んだりチャットしたりする") : ___bsJa("Play and chat with your friends", "友達と遊んだりチャットしたりする")}</span>
      </footer>
    </aside>
  );
}

async function optimizeImage(file, { maxBytes = 6_000_000, width = 512, height = 512, quality = 0.82 } = {}) {
  if (!file) return null;
  if (file.size > maxBytes) throw new Error(`Imagem muito grande. Máximo: ${Math.round(maxBytes / 1_000_000)} MB.`);

  const source = await new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ""));
    reader.onerror = () => reject(new Error("Não foi possível ler a imagem."));
    reader.readAsDataURL(file);
  });

  const image = await new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Não foi possível preparar a imagem."));
    img.src = source;
  });

  const ratio = Math.min(width / image.naturalWidth, height / image.naturalHeight, 1);
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(image.naturalWidth * ratio));
  canvas.height = Math.max(1, Math.round(image.naturalHeight * ratio));
  const context = canvas.getContext("2d");
  if (!context) return source;
  context.drawImage(image, 0, 0, canvas.width, canvas.height);

  for (const nextQuality of [quality, 0.72, 0.6]) {
    const encoded = canvas.toDataURL("image/webp", nextQuality);
    if (encoded.length < 900_000) return encoded;
  }
  return canvas.toDataURL("image/jpeg", 0.68);
}

export default function Profile({ onBack, initialUsername = null }) {
  const { language } = useLanguage();
  const pt = language !== "en";
  const decks = useMemo(() => getDecks(), []);
  const insights = useMemo(() => buildPlayerSocialInsights(decks, cardIndex), [decks]);

  const initialProfile = useMemo(() => {
    const current = getProfile() || {};
    return {
      ...current,
      privacy: { ...DEFAULT_SOCIAL_PRIVACY, ...(current.privacy || {}) }
    };
  }, []);

  const [profile, setProfile] = useState(initialProfile);
  const [section, setSection] = useState("overview");
  const [friends, setFriends] = useState([]);
  const [conversations, setConversations] = useState([]);
  const [requests, setRequests] = useState({ incoming: [], outgoing: [] });
  const [notifications, setNotifications] = useState([]);
  const [blocked, setBlocked] = useState([]);
  const [schema, setSchema] = useState({ ready: false, mode: accountsEnabled ? "legacy" : "local", version: null });
  const [sessionUser, setSessionUser] = useState(null);
  const [selectedFriend, setSelectedFriend] = useState(null);
  const [messages, setMessages] = useState([]);
  const [chatText, setChatText] = useState("");
  const [query, setQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [remoteProfile, setRemoteProfile] = useState(null);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState("");
  const [saved, setSaved] = useState(false);
  const [friendFilter, setFriendFilter] = useState("");
  const [typingFriend, setTypingFriend] = useState(false);
  const [matchHistory, setMatchHistory] = useState([]);
  const [historySource, setHistorySource] = useState("local");
  const [masteryRows, setMasteryRows] = useState([]);
  const [masterySource, setMasterySource] = useState("local");
  const [selectedMastery, setSelectedMastery] = useState(null);
  const [rankedProfile, setRankedProfile] = useState(null);
  const [rankedHistory, setRankedHistory] = useState([]);
  const [friendRanks, setFriendRanks] = useState({});
  const typingStopRef = useRef(null);
  const aliveRef = useRef(true);

  const displayName = profile.displayName || profile.name || (language === "ja" ? "プレイヤー" : pt ? "Jogador" : "Player");
  const username = profile.username || "username";
  const privacy = { ...DEFAULT_SOCIAL_PRIVACY, ...(profile.privacy || {}) };
  const privacyRef = useRef(privacy);
  privacyRef.current = privacy;
  const unreadMessages = conversations.reduce((sum, item) => sum + Number(item.unread_count || 0), 0);
  const unreadNotifications = notifications.filter((item) => !item.read_at).length;
  const incomingCount = requests.incoming.length;
  const matchStats = useMemo(() => summarizeMatchHistory(matchHistory), [matchHistory]);
  const masteryStats = useMemo(() => summarizeCardMastery(masteryRows), [masteryRows]);
  const rankedStats = useMemo(() => summarizeRankedHistory(rankedHistory), [rankedHistory]);
  const rankedMatches = Number(rankedProfile?.wins || 0) + Number(rankedProfile?.losses || 0);
  const rankedWinRate = rankedMatches ? Math.round((Number(rankedProfile?.wins || 0) / rankedMatches) * 100) : 0;
  const rankTier = String(rankedProfile?.rank?.tier || "unranked").toLowerCase();

  async function refreshSocial() {
    if (!accountsEnabled) return;
    const next = await loadSocialBootstrap();
    if (!aliveRef.current) return;
    setFriends(next.friends || []);
    setConversations(next.conversations || []);
    setRequests(next.requests || { incoming: [], outgoing: [] });
    setNotifications(next.notifications || []);
    setBlocked(next.blocked || []);
    setSchema(next.schema || { ready: false, mode: "legacy" });
  }

  useEffect(() => {
    aliveRef.current = true;
    let stopRealtime = () => {};
    let refreshTimer = null;
    let presenceTimer = null;
    let socialPollTimer = null;

    (async () => {
      if (!accountsEnabled) return;
      const session = await getAccountSession();
      if (aliveRef.current) setSessionUser(session.user || null);
      await refreshSocial();
      await touchSocialPresence(privacyRef.current.showOnlineStatus ? "online" : "invisible");
      stopRealtime = await subscribeSocialEvents(async () => {
        clearTimeout(refreshTimer);
        refreshTimer = setTimeout(() => refreshSocial(), 220);
      });
      presenceTimer = setInterval(() => touchSocialPresence(privacyRef.current.showOnlineStatus ? "online" : "invisible"), 60_000);
      socialPollTimer = setInterval(() => refreshSocial(), 20_000);
    })();

    return () => {
      aliveRef.current = false;
      clearTimeout(refreshTimer);
      clearInterval(presenceTimer);
      clearInterval(socialPollTimer);
      stopRealtime?.();
      touchSocialPresence("offline").catch(() => {});
    };
    // Social presence intentionally exists only while Social Hub is mounted.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    let active = true;
    (async () => {
      const history = await loadMatchHistory({ limit: 120 });
      if (!active) return;
      setMatchHistory(history.rows || []);
      setHistorySource(history.source || "local");
      await reconcileMasteryFromHistory(history.rows || []);
      const mastery = await loadCardMastery({ limit: 100 });
      if (!active) return;
      setMasteryRows(mastery.rows || []);
      setMasterySource(mastery.source || "local");
    })();
    return () => { active = false; };
  }, [sessionUser, schema.version]);

  useEffect(() => {
    let active = true;
    if (!accountsEnabled || !sessionUser || !schema.ready) {
      setRankedProfile(null); setRankedHistory([]); setFriendRanks({});
      return () => { active = false; };
    }
    (async () => {
      const [profileResult, historyResult, ranks] = await Promise.all([
        loadRankedProfile(), loadRankedHistory({ limit: 40 }), loadFriendRankedIdentities()
      ]);
      if (!active) return;
      if (profileResult.ok) setRankedProfile(profileResult.profile);
      if (historyResult.ok) setRankedHistory(historyResult.rows || []);
      setFriendRanks(ranks || {});
    })();
    return () => { active = false; };
  }, [sessionUser, schema.version, schema.ready]);

  useEffect(() => {
    if (!selectedFriend || !accountsEnabled) return undefined;
    const id = personId(selectedFriend);
    let active = true;
    const reload = async () => {
      const next = await loadDirectMessages(id);
      if (active) setMessages(next);
      await markConversationRead(id);
    };
    reload();
    const timer = setInterval(reload, 12_000);
    return () => {
      active = false;
      clearInterval(timer);
    };
  }, [selectedFriend]);

  useEffect(() => {
    if (!selectedFriend || !accountsEnabled) { setTypingFriend(false); return undefined; }
    let stop = () => {};
    let active = true;
    (async () => {
      stop = await subscribeConversationTyping(personId(selectedFriend), (typing) => {
        if (!active) return;
        setTypingFriend(typing);
        if (typing) {
          clearTimeout(typingStopRef.current);
          typingStopRef.current = setTimeout(() => setTypingFriend(false), 2400);
        }
      });
    })();
    return () => { active = false; clearTimeout(typingStopRef.current); stop?.(); setTypingFriend(false); };
  }, [selectedFriend]);

  function flash(message) {
    setNotice(language === "ja" ? japaneseGameError(message) : message);
    window.setTimeout(() => setNotice(""), 2600);
  }

  async function saveIdentity() {
    const next = {
      ...profile,
      username: String(profile.username || "").trim().toLowerCase(),
      displayName: String(profile.displayName || profile.name || "").trim() || (language === "ja" ? "プレイヤー" : pt ? "Jogador" : "Player"),
      privacy
    };
    next.name = next.displayName;
    saveProfile(next);
    setProfile(next);
    setSaved(true);
    window.setTimeout(() => setSaved(false), 1800);

    if (accountsEnabled && sessionUser) {
      const result = await syncProfileToCloud(next);
      flash(result.ok ? (language === "ja" ? "プロフィールを同期しました。" : pt ? "Perfil sincronizado." : "Profile synced.") : result.error);
    } else {
      flash(language === "ja" ? "プロフィールをこの端末に保存しました。" : pt ? "Perfil salvo neste dispositivo." : "Profile saved on this device.");
    }
  }

  async function savePrivacy() {
    const next = { ...profile, privacy };
    setProfile(next);
    saveProfile(next);
    if (!accountsEnabled || !sessionUser) {
      flash(language === "ja" ? "設定をこの端末に保存しました。" : pt ? "Preferências locais salvas." : "Local preferences saved.");
      return;
    }
    const result = await savePrivacySettings(privacy);
    flash(result.ok ? (language === "ja" ? "プライバシー設定を更新しました。" : pt ? "Privacidade atualizada." : "Privacy updated.") : result.error);
    if (result.ok) await touchSocialPresence(privacy.showOnlineStatus ? "online" : "invisible");
  }

  async function handleImage(kind, file) {
    try {
      const nextImage = await optimizeImage(file, kind === "avatar"
        ? { maxBytes: 6_000_000, width: 320, height: 320, quality: 0.84 }
        : { maxBytes: 8_000_000, width: 1600, height: 640, quality: 0.78 });
      setProfile((current) => ({ ...current, [kind]: nextImage }));
    } catch (error) {
      flash(language === "ja" ? "この画像を使用できません。別のファイルをお試しください。" : pt ? "Não foi possível usar esta imagem. Tente outro arquivo." : "Could not use this image. Try another file.");
    }
  }

  async function doSearch() {
    if (!query.trim()) return;
    setBusy(true);
    try {
      setSearchResults(await searchProfiles(query));
    } finally {
      setBusy(false);
    }
  }

  async function requestFriend(targetId) {
    setBusy(true);
    const result = await sendFriendRequest(targetId);
    flash(result.ok ? (result.status === "accepted" ? (language === "ja" ? "フレンド申請を承認しました。" : pt ? "Amizade aceita." : "Friendship accepted.") : (language === "ja" ? "申請を送信しました。" : pt ? "Pedido enviado." : "Request sent.")) : result.error);
    await refreshSocial();
    setBusy(false);
  }

  async function answerRequest(requestId, response) {
    setBusy(true);
    const result = await respondFriendRequest(requestId, response);
    flash(result.ok ? (response === "accept" ? (language === "ja" ? "申請を承認しました。" : pt ? "Pedido aceito." : "Request accepted.") : (language === "ja" ? "申請を拒否しました。" : pt ? "Pedido recusado." : "Request declined.")) : result.error);
    await refreshSocial();
    setBusy(false);
  }

  async function openChat(friend) {
    setSelectedFriend(friend);
    setSection("messages");
    const id = personId(friend);
    setMessages(await loadDirectMessages(id));
    await markConversationRead(id);
    await refreshSocial();
  }

  async function sendMessage(event) {
    event.preventDefault();
    if (!selectedFriend || !chatText.trim()) return;
    const id = personId(selectedFriend);
    const result = await sendDirectMessage(id, chatText);
    if (!result.ok) {
      flash(result.error);
      return;
    }
    setChatText("");
    setMessages(await loadDirectMessages(id));
    await refreshSocial();
  }

  async function inspectProfile(person) {
    const id = personId(person);
    if (!id) return;
    setBusy(true);
    const [social, competitive] = await Promise.all([loadSocialProfile(id), loadPublicRankedIdentity(id)]);
    setRemoteProfile(social ? { ...social, ranked: competitive?.visible === false ? null : competitive } : null);
    setBusy(false);
  }

  const initialProfileOpenedRef = useRef(false);

  useEffect(() => {
    if (!initialUsername || !sessionUser || !schema.ready || initialProfileOpenedRef.current) return;
    initialProfileOpenedRef.current = true;
    (async () => {
      const normalized = String(initialUsername).replace(/^@/, "").trim().toLowerCase();
      const results = await searchProfiles(normalized);
      const exact = (results || []).find((row) => String(row.username || "").toLowerCase() === normalized);
      if (exact) await inspectProfile(exact);
      else flash(language === "ja" ? "対戦相手のプロフィールが見つかりませんでした。" : pt ? "Perfil do adversário não encontrado." : "Opponent profile not found.");
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialUsername, sessionUser, schema.ready]);

  async function handleRemoveFriend(friend) {
    const result = await removeFriend(personId(friend));
    flash(result.ok ? (language === "ja" ? "フレンドを解除しました。" : pt ? "Amigo removido." : "Friend removed.") : result.error);
    setRemoteProfile(null);
    setSelectedFriend(null);
    await refreshSocial();
  }

  async function handleBlock(person) {
    const result = await blockUser(personId(person));
    flash(result.ok ? (language === "ja" ? "プレイヤーをブロックしました。" : pt ? "Jogador bloqueado." : "Player blocked.") : result.error);
    setRemoteProfile(null);
    setSelectedFriend(null);
    await refreshSocial();
  }

  async function handleUnblock(person) {
    const result = await unblockUser(personId(person));
    flash(result.ok ? (language === "ja" ? "プレイヤーのブロックを解除しました。" : pt ? "Jogador desbloqueado." : "Player unblocked.") : result.error);
    await refreshSocial();
  }

  async function changeFriendPreference(friend, patch) {
    const result = await setFriendPreference(personId(friend), patch);
    flash(result.ok ? (language === "ja" ? "設定を更新しました。" : pt ? "Preferência atualizada." : "Preference updated.") : result.error);
    if (result.ok) await refreshSocial();
  }

  function handleTypingChange(value) {
    setChatText(value);
    if (!selectedFriend) return;
    sendTypingSignal(personId(selectedFriend), Boolean(value.trim())).catch(() => {});
    clearTimeout(typingStopRef.current);
    typingStopRef.current = setTimeout(() => sendTypingSignal(personId(selectedFriend), false).catch(() => {}), 1300);
  }

  async function openNotifications() {
    setSection("notifications");
    await markAllNotificationsRead();
    await refreshSocial();
  }

  const relatedPeople = useMemo(() => {
    const map = new Map();
    for (const friend of friends) map.set(personId(friend), friend);
    for (const conversation of conversations) map.set(personId(conversation), conversation);
    for (const item of [...requests.incoming, ...requests.outgoing]) map.set(item.user_id, item);
    return map;
  }, [friends, conversations, requests]);

  const nav = [
    ["overview", "◇", pt ? "Visão geral" : "Overview", 0],
    ["profile", "◈", pt ? "Perfil" : "Profile", 0],
    ["friends", "＋", pt ? "Amigos" : "Friends", incomingCount],
    ["messages", "✦", pt ? "Mensagens" : "Messages", unreadMessages],
    ["notifications", "•", pt ? "Notificações" : "Notifications", unreadNotifications],
    ["statistics", "▥", pt ? "Estatísticas" : "Statistics", 0],
    ["competitive", "♢", pt ? "Competitivo" : "Competitive", 0],
    ["mastery", "◆", pt ? "Maestria" : "Mastery", 0],
    ["privacy", "▣", pt ? "Privacidade" : "Privacy", 0]
  ];
  const japaneseNav = { overview: "概要", profile: "プロフィール", friends: "フレンド", messages: "メッセージ", notifications: "通知", statistics: "対戦成績", competitive: "ランク対戦", mastery: "マスタリー", privacy: "プライバシー" };

  return (
    <main className="social-hub-page eternal-page">
      <EternalCinematicBackdrop compact />
      <div className="social-hub-shade" aria-hidden="true" />

      <header className="social-hub-topbar">
        <button type="button" className="eternal-menu-action social-hub-back" onClick={onBack}>{pt ? ___bsJa("Voltar", "戻る") : ___bsJa("Back", "戻る")}</button>
        <div className="social-hub-title">
          <span>{___bsJa("SOCIAL HUB", "ソーシャルハブ")}</span>
          <h1>{pt ? ___bsJa("Perfil & Comunidade", "プロフィールとコミュニティ") : ___bsJa("Profile & Community", "プロフィールとコミュニティ")}</h1>
        </div>
        <div className="social-hub-top-actions">
          <span className={`social-cloud-state ${sessionUser ? "online" : ""}`}>
            <i />
            <b>{sessionUser ? (pt ? ___bsJa("Nuvem conectada", "クラウド接続") : ___bsJa("Cloud connected", "クラウド接続")) : accountsEnabled ? ___bsJa("Offline", "オフライン") : ___bsJa("Local", "ローカル")}</b>
          </span>
          <button type="button" className="social-notification-button" onClick={openNotifications} aria-label={pt ? ___bsJa("Notificações", "通知") : ___bsJa("Notifications", "通知")}>
            ✦
            {unreadNotifications > 0 && <em>{unreadNotifications}</em>}
          </button>
        </div>
      </header>

      {accountsEnabled && sessionUser && !schema.ready && (
        <div className="social-schema-notice">
          <strong>{pt ? ___bsJa("Alguns recursos sociais estão indisponíveis", "一部のソーシャル機能は利用できません") : ___bsJa("Some social features are unavailable", "一部のソーシャル機能は利用できません")}</strong>
          <span>{pt ? ___bsJa("Tente novamente mais tarde. Seu perfil local continua disponível.", "後でもう一度試してください。ローカル プロフィールは引き続き利用可能です。") : ___bsJa("Try again later. Your local profile remains available.", "後でもう一度試してください。ローカル プロフィールは引き続き利用可能です。")}</span>
        </div>
      )}

      <section className="social-hub-shell">
        <aside className="social-hub-sidebar">
          <div className="social-self-card">
            <div className="social-self-banner" style={profile.banner ? { backgroundImage: `linear-gradient(180deg,rgba(0,0,0,.08),rgba(0,0,0,.72)),url(${profile.banner})` } : undefined} />
            <div className="social-self-identity">
              <SocialAvatar person={{ ...profile, display_name: displayName }} size="large" />
              <div>
                <strong>{displayName}</strong>
                <small>@{username}</small>
              </div>
            </div>
            <span className="social-profile-visibility">{privacy.profileVisibility === "public" ? (pt ? ___bsJa("Público", "公開") : ___bsJa("Public", "公開")) : privacy.profileVisibility === "friends" ? (pt ? ___bsJa("Só amigos", "友達のみ") : ___bsJa("Friends only", "友達のみ")) : (pt ? ___bsJa("Privado", "プライベート") : ___bsJa("Private", "プライベート"))}</span>
          </div>

          <nav className="social-hub-nav">
            {nav.map(([key, icon, label, badge]) => (
              <SocialNavButton key={key} icon={icon} label={language === "ja" ? japaneseNav[key] : label} badge={badge} active={section === key} onClick={() => setSection(key)} />
            ))}
          </nav>

          <div className="social-hub-safety-note">
            <span>{pt ? ___bsJa("PRIVACIDADE", "プライバシー") : ___bsJa("PRIVACY", "プライバシー")}</span>
            <p>{pt ? ___bsJa("Você escolhe quem pode ver seu perfil, enviar mensagens e interagir com você.", "あなたのプロフィールを閲覧したり、メッセージを送ったり、やり取りしたりできる人を選択します。") : ___bsJa("You choose who can view your profile, message you and interact with you.", "あなたのプロフィールを閲覧したり、メッセージを送ったり、やり取りしたりできる人を選択します。")}</p>
          </div>
        </aside>

        <section className="social-hub-content">
          {notice && <div className="social-toast">{notice}</div>}

          {section === "overview" && (
            <div className="social-view social-overview-view">
              <section className={`social-overview-hero social-ranked-frame rank-${rankTier}`} style={profile.banner ? { backgroundImage: `linear-gradient(90deg,rgba(0,0,0,.2),rgba(0,0,0,.82)),url(${profile.banner})` } : undefined}>
                <div className="social-overview-avatar"><SocialAvatar person={{ ...profile, display_name: displayName }} size="hero" /></div>
                <div className="social-overview-copy">
                  <span>{pt ? ___bsJa("DUELISTA", "デュエリスト") : ___bsJa("DUELIST", "デュエリスト")}</span>
                  <h2>{displayName}</h2>
                  <small>@{username}</small>
                  {rankedProfile && <div className={`social-rank-badge rank-${rankTier}`}><b>{rankedProfile.rank?.label}</b><span>{rankedProfile.rp}{___bsJa(" RP · Season 0", " RP・シーズン0")}</span></div>}
                  <p>{profile.bio || (pt ? ___bsJa("Adicione uma bio para contar um pouco sobre você à comunidade.", "プロフィールを追加して、コミュニティに自分自身について少し伝えます。") : ___bsJa("Add a bio to tell the community a little about yourself.", "プロフィールを追加して、コミュニティに自分自身について少し伝えます。"))}</p>
                </div>
                <div className="social-overview-actions">
                  <button type="button" className="eternal-menu-action" onClick={() => setSection("profile")}>{pt ? ___bsJa("Editar perfil", "プロフィールの編集") : ___bsJa("Edit profile", "プロフィールの編集")}</button>
                  <button type="button" className="eternal-menu-action" onClick={() => setSection("privacy")}>{pt ? ___bsJa("Privacidade", "プライバシー") : ___bsJa("Privacy", "プライバシー")}</button>
                </div>
              </section>

              <div className="social-stat-strip">
                <article><span>{pt ? ___bsJa("Partidas", "対戦数") : ___bsJa("Matches", "対戦数")}</span><strong>{matchStats.total}</strong><small>{matchStats.wins} {pt ? ___bsJa("vitórias", "勝") : ___bsJa("wins", "勝")}</small></article>
                <article><span>{pt ? ___bsJa("Taxa de vitória", "勝率") : ___bsJa("Win rate", "勝率")}</span><strong>{matchStats.total ? `${matchStats.winRate}%` : "—"}</strong><small>{matchStats.losses} {pt ? ___bsJa("derrotas", "敗") : ___bsJa("losses", "敗")}</small></article>
                <article><span>{pt ? ___bsJa("Deck favorito", "好きなデッキ") : ___bsJa("Favorite deck", "好きなデッキ")}</span><strong>{matchStats.favoriteDeck?.name || "—"}</strong><small>{matchStats.favoriteDeck ? `${matchStats.favoriteDeck.matches}${language === "ja" ? "戦" : pt ? " partidas" : " matches"}` : (pt ? ___bsJa("sem dados", "データがありません") : ___bsJa("no data", "データがありません"))}</small></article>
                <article><span>{pt ? ___bsJa("Afinidade", "よく使う色") : ___bsJa("Affinity", "よく使う色")}</span><strong>{displayColor(matchStats.primaryColor || insights.primaryColor, language)}</strong><small>{matchStats.primaryColor ? (pt ? ___bsJa("baseada em partidas", "試合に基づいて") : ___bsJa("based on matches", "試合に基づいて")) : (pt ? ___bsJa("baseada nos decks", "デッキに基づいて") : ___bsJa("based on decks", "デッキに基づいて"))}</small></article>
              </div>

              <section className="social-overview-grid">
                <div className="social-panel social-overview-mastery">
                  <SocialSectionTitle eyebrow={___bsJa("CARD MASTERY", "カードマスタリー")} title={pt ? ___bsJa("Cartas em destaque", "注目のカード") : ___bsJa("Featured cards", "注目のカード")} description={pt ? ___bsJa("Maestria baseada na presença das cartas nos seus decks salvos.", "保存したデッキでのカード使用状況をもとに表示します。") : ___bsJa("Mastery based on how strongly cards appear across your saved decks.", "保存したデッキでのカード使用状況をもとに表示します。")} action={<button type="button" className="social-text-button" onClick={() => setSection("mastery")}>{pt ? ___bsJa("Ver tudo", "全て見る") : ___bsJa("See all", "全て見る")}</button>} />
                  <div className="social-mastery-row">
                    {masteryRows.slice(0, 3).map((entry) => <MasteryCard key={entry.id} entry={entry} language={language} onClick={setSelectedMastery} />)}
                    {!masteryRows.length && <div className="social-empty-inline">{pt ? ___bsJa("Finalize partidas com um deck salvo para começar sua Maestria.", "保存したデッキで試合を終了すると、マスタリーが開始されます。") : ___bsJa("Finish matches with a saved deck to start your Mastery.", "保存したデッキで試合を終了すると、マスタリーが開始されます。")}</div>}
                  </div>
                </div>

                <div className="social-panel social-recent-decks">
                  <SocialSectionTitle eyebrow={___bsJa("DECK PROFILE", "デッキプロフィール")} title={pt ? ___bsJa("Decks recentes", "最近のデッキ") : ___bsJa("Recent decks", "最近のデッキ")} description={pt ? ___bsJa("Últimos decks editados na sua biblioteca.", "ライブラリ内の最近編集されたデッキ。") : ___bsJa("Recently edited decks in your library.", "ライブラリ内の最近編集されたデッキ。")} />
                  <div className="social-deck-mini-list">
                    {insights.topDecks.map((deck) => {
                      const cover = deck.coverCardId ? cardIndex.get(deck.coverCardId) : null;
                      return (
                        <article key={deck.id}>
                          <span className="social-deck-cover">{cover?.image ? <img src={cover.image} alt="" /> : "◇"}</span>
                          <div><strong>{deck.name}</strong><small>{deck.cards} {pt ? ___bsJa("cartas", "枚") : ___bsJa("cards", "枚")}</small></div>
                        </article>
                      );
                    })}
                    {!insights.topDecks.length && <div className="social-empty-inline">{pt ? ___bsJa("Nenhum deck salvo.", "保存されたデッキはありません。") : ___bsJa("No saved decks.", "保存されたデッキはありません。")}</div>}
                  </div>
                </div>
              </section>
            </div>
          )}

          {section === "profile" && (
            <div className="social-view social-profile-editor">
              <SocialSectionTitle eyebrow={___bsJa("PLAYER IDENTITY", "プレイヤー情報")} title={pt ? ___bsJa("Configuração do perfil", "プロフィールの設定") : ___bsJa("Profile setup", "プロフィールの設定")} description={pt ? ___bsJa("Personalize como sua identidade aparece para outros jogadores.", "他のプレイヤーに表示されるプロフィールを編集します。") : ___bsJa("Customize how your identity appears to other players.", "他のプレイヤーに表示されるプロフィールを編集します。")} action={<span className={`social-save-state ${saved ? "saved" : ""}`}>{saved ? (pt ? ___bsJa("SALVO", "保存されました") : ___bsJa("SAVED", "保存されました")) : (pt ? ___bsJa("EDITANDO", "編集") : ___bsJa("EDITING", "編集"))}</span>} />

              <div className="social-profile-media-editor">
                <div className="social-profile-banner-preview" style={profile.banner ? { backgroundImage: `linear-gradient(180deg,transparent,rgba(0,0,0,.68)),url(${profile.banner})` } : undefined}>
                  <label>{pt ? ___bsJa("Trocar banner", "バナーの変更") : ___bsJa("Change banner", "バナーの変更")}<input hidden type="file" accept="image/*" onChange={(event) => handleImage("banner", event.target.files?.[0])} /></label>
                </div>
                <div className="social-profile-avatar-editor">
                  <SocialAvatar person={{ ...profile, display_name: displayName }} size="hero" />
                  <label>{pt ? ___bsJa("Trocar avatar", "アバターの変更") : ___bsJa("Change avatar", "アバターの変更")}<input hidden type="file" accept="image/*" onChange={(event) => handleImage("avatar", event.target.files?.[0])} /></label>
                </div>
              </div>

              <div className="social-form-grid">
                <label><span>{pt ? ___bsJa("Nome de exibição", "表示名") : ___bsJa("Display name", "表示名")}</span><input maxLength={40} value={profile.displayName || profile.name || ""} onChange={(event) => setProfile({ ...profile, displayName: event.target.value, name: event.target.value })} /></label>
                <label><span>{pt ? ___bsJa("Nome de usuário", "ユーザー名") : ___bsJa("Username", "ユーザー名")}</span><div className="social-username-input"><b>@</b><input maxLength={24} value={profile.username || ""} onChange={(event) => setProfile({ ...profile, username: event.target.value.replace(/[^a-zA-Z0-9_.-]/g, "") })} /></div></label>
                <label><span>{pt ? ___bsJa("Status personalizado", "カスタムステータス") : ___bsJa("Custom status", "カスタムステータス")} <small>{String(profile.customStatus || "").length}/80</small></span><input maxLength={80} value={profile.customStatus || ""} onChange={(event) => setProfile({ ...profile, customStatus: event.target.value })} placeholder={pt ? ___bsJa("Ex.: Montando deck Roxo", "例えば紫のデッキを構築する") : ___bsJa("e.g. Building a Purple deck", "例えば紫のデッキを構築する")} /></label><label className="wide"><span>{___bsJa("Bio ", "自己紹介 ")}<small>{String(profile.bio || "").length}/240</small></span><textarea maxLength={240} value={profile.bio || ""} onChange={(event) => setProfile({ ...profile, bio: event.target.value })} placeholder={pt ? ___bsJa("Conte um pouco sobre você...", "あなた自身についてコミュニティに伝えてください...") : ___bsJa("Tell the community about yourself...", "あなた自身についてコミュニティに伝えてください...")} /></label>
              </div>
              <footer className="social-view-actions"><span>{accountsEnabled && sessionUser ? (pt ? ___bsJa("Salva localmente e sincroniza com sua conta.", "ローカルに保存し、アカウントと同期します。") : ___bsJa("Saves locally and syncs with your account.", "ローカルに保存し、アカウントと同期します。")) : (pt ? ___bsJa("Salva somente neste dispositivo.", "このデバイスにのみ保存されます。") : ___bsJa("Saves only on this device.", "このデバイスにのみ保存されます。"))}</span><button type="button" className="eternal-menu-action active" onClick={saveIdentity}>{pt ? ___bsJa("Salvar perfil", "プロフィールの保存") : ___bsJa("Save profile", "プロフィールの保存")}</button></footer>
            </div>
          )}

          {section === "friends" && (
            <div className="social-view social-friends-view">
              <SocialSectionTitle eyebrow={___bsJa("SOCIAL CONNECTIONS", "フレンド")} title={pt ? ___bsJa("Amigos & pedidos", "フレンドと申請") : ___bsJa("Friends & requests", "フレンドと申請")} description={pt ? ___bsJa("Pedidos precisam ser aceitos antes de criar uma amizade. Nada é aprovado automaticamente.", "フレンドになるには、リクエストを承認する必要があります。") : ___bsJa("Requests must be accepted before a friendship is created. Nothing is auto-approved.", "フレンドになるには、リクエストを承認する必要があります。")} />

              {!accountsEnabled || !sessionUser ? (
                <div className="social-big-empty"><b>◇</b><strong>{pt ? ___bsJa("Entre na conta para usar Amigos", "フレンド機能を使うにはログインしてください") : ___bsJa("Sign in to use Friends", "フレンド機能を使うにはログインしてください")}</strong><span>{pt ? ___bsJa("Seu perfil, decks e Maestria local continuam funcionando offline.", "プロフィール、デッキ、ローカルマスタリーはオフラインでも機能します。") : ___bsJa("Your profile, decks and local Mastery still work offline.", "プロフィール、デッキ、ローカルマスタリーはオフラインでも機能します。")}</span></div>
              ) : (
                <>
                  <div className="social-search-box"><input value={query} onChange={(event) => setQuery(event.target.value)} onKeyDown={(event) => event.key === "Enter" && doSearch()} placeholder={pt ? ___bsJa("Buscar @usuário ou nome...", "@ユーザー名または名前を検索...") : ___bsJa("Search @username or name...", "@ユーザー名または名前を検索...")} /><button type="button" onClick={doSearch} disabled={busy}>{pt ? ___bsJa("Buscar", "検索") : ___bsJa("Search", "検索")}</button></div>

                  {requests.incoming.length > 0 && (
                    <section className="social-panel social-request-panel">
                      <SocialSectionTitle eyebrow={___bsJa("INCOMING", "着信中")} title={pt ? ___bsJa("Pedidos recebidos", "受信リクエスト") : ___bsJa("Incoming requests", "受信リクエスト")} description={`${requests.incoming.length}`} />
                      <div className="social-request-list">
                        {requests.incoming.map((request) => (
                          <article key={request.request_id}>
                            <button type="button" className="social-person-main" onClick={() => inspectProfile(request)}><SocialAvatar person={request} /><span><strong>{personName(request)}</strong><small>@{request.username}</small></span></button>
                            <div className="social-row-actions"><button type="button" onClick={() => answerRequest(request.request_id, "accept")}>{pt ? ___bsJa("Aceitar", "受け入れる") : ___bsJa("Accept", "受け入れる")}</button><button type="button" onClick={() => answerRequest(request.request_id, "decline")}>{pt ? ___bsJa("Recusar", "衰退") : ___bsJa("Decline", "衰退")}</button></div>
                          </article>
                        ))}
                      </div>
                    </section>
                  )}

                  {searchResults.length > 0 && (
                    <section className="social-panel">
                      <SocialSectionTitle eyebrow={___bsJa("SEARCH", "検索")} title={pt ? ___bsJa("Resultados", "結果") : ___bsJa("Results", "結果")} description={`${searchResults.length}`} />
                      <div className="social-request-list compact">
                        {searchResults.map((person) => (
                          <article key={person.id}>
                            <button type="button" className="social-person-main" onClick={() => inspectProfile(person)}><SocialAvatar person={person} /><span><strong>{personName(person)}</strong><small>@{person.username}</small></span></button>
                            <div className="social-row-actions">
                              {person.relation_status === "accepted" ? <span className="social-relation-label">{pt ? ___bsJa("Amigo", "友達") : ___bsJa("Friend", "友達")}</span> : person.relation_status === "pending" ? <span className="social-relation-label">{pt ? ___bsJa("Pendente", "保留中") : ___bsJa("Pending", "保留中")}</span> : <button type="button" onClick={() => requestFriend(person.id)}>{pt ? ___bsJa("Adicionar", "友達追加") : ___bsJa("Add friend", "友達追加")}</button>}
                            </div>
                          </article>
                        ))}
                      </div>
                    </section>
                  )}

                  <section className="social-panel social-manage-friends">
                    <SocialSectionTitle eyebrow={___bsJa("FRIEND LIST", "友達リスト")} title={pt ? ___bsJa("Sua lista", "あなたのリスト") : ___bsJa("Your list", "あなたのリスト")} description={language === "ja" ? `フレンド${friends.length}人` : `${friends.length} ${pt ? "amigos" : "friends"}`} action={<input className="social-inline-filter" value={friendFilter} onChange={(event) => setFriendFilter(event.target.value)} placeholder={pt ? ___bsJa("Filtrar amigos...", "友達をフィルタリング...") : ___bsJa("Filter friends...", "友達をフィルタリング...")} />} />
                    <div className="social-friend-grid">
                      {[...friends].filter((friend) => personName(friend).toLowerCase().includes(friendFilter.toLowerCase()) || String(friend.username || "").toLowerCase().includes(friendFilter.toLowerCase())).sort((a,b) => Number(Boolean(b.is_favorite))-Number(Boolean(a.is_favorite)) || Number(Boolean(b.is_online))-Number(Boolean(a.is_online)) || personName(a).localeCompare(personName(b))).map((friend) => (
                        <article key={personId(friend)}>
                          <button type="button" className="social-person-main" onClick={() => inspectProfile(friend)}><SocialAvatar person={friend} /><span><strong>{friend.is_favorite ? "★ " : ""}{personName(friend)} {friendRanks[personId(friend)]?.rank?.label && <em className={`social-rank-mini rank-${friendRanks[personId(friend)].rank.tier.toLowerCase()}`}>{friendRanks[personId(friend)].rank.label}</em>}</strong><small>{friend.custom_status || presenceLabel(friend, pt)}</small></span></button>
                          <div className="social-friend-quick-actions"><button type="button" className={friend.is_favorite ? "active" : ""} title={pt ? ___bsJa("Favorito", "お気に入り") : ___bsJa("Favorite", "お気に入り")} onClick={() => changeFriendPreference(friend,{ favorite: !friend.is_favorite })}>★</button><button type="button" className={friend.is_muted ? "active" : ""} title={pt ? ___bsJa("Silenciar", "ミュート") : ___bsJa("Mute", "ミュート")} onClick={() => changeFriendPreference(friend,{ muted: !friend.is_muted })}>◌</button><button type="button" className="social-message-shortcut" onClick={() => openChat(friend)}>✦</button></div>
                        </article>
                      ))}
                      {!friends.length && <div className="social-empty-inline">{pt ? ___bsJa("Nenhum amigo aceito ainda.", "まだ承認された友達がいません。") : ___bsJa("No accepted friends yet.", "まだ承認された友達がいません。")}</div>}
                    </div>
                  </section>

                  {requests.outgoing.length > 0 && <div className="social-pending-strip"><span>{pt ? ___bsJa("Pedidos enviados", "送信されたリクエスト") : ___bsJa("Sent requests", "送信されたリクエスト")}</span>{requests.outgoing.map((item) => <b key={item.request_id}>@{item.username}</b>)}</div>}
                </>
              )}
            </div>
          )}

          {section === "messages" && (
            <div className="social-view social-messages-view">
              <SocialSectionTitle eyebrow={___bsJa("DIRECT MESSAGES", "ダイレクトメッセージ")} title={pt ? ___bsJa("Mensagens privadas", "プライベートメッセージ") : ___bsJa("Private messages", "プライベートメッセージ")} description={pt ? ___bsJa("Converse com seus amigos e acompanhe mensagens não lidas.", "友達とチャットしたり、未読メッセージを追跡したりできます。") : ___bsJa("Chat with friends and keep track of unread messages.", "友達とチャットしたり、未読メッセージを追跡したりできます。")} />
              <div className="social-chat-layout">
                <aside className="social-conversation-list">
                  {conversations.map((friend) => (
                    <button type="button" key={personId(friend)} className={personId(selectedFriend) === personId(friend) ? "active" : ""} onClick={() => openChat(friend)}>
                      <SocialAvatar person={friend} size="small" /><span><strong>{friend.is_favorite ? "★ " : ""}{personName(friend)}{friend.is_muted ? " · ◌" : ""}</strong><small>{Number(friend.unread_count || 0) > 0 ? `${friend.unread_count} ${language === "ja" ? "件の未読" : pt ? "não lidas" : "unread"}` : friend.last_message || friend.custom_status || presenceLabel(friend, pt)}</small></span>{friend.is_online && <i />}
                    </button>
                  ))}
                  {!conversations.length && <div className="social-empty-inline">{pt ? ___bsJa("Suas conversas aparecerão aqui.", "会話がここに表示されます。") : ___bsJa("Your conversations will appear here.", "会話がここに表示されます。")}</div>}
                </aside>

                <section className="social-chat-thread">
                  {selectedFriend ? (
                    <>
                      <header><SocialAvatar person={selectedFriend} /><div><strong>{personName(selectedFriend)}</strong><small>{typingFriend ? (pt ? ___bsJa("digitando…", "タイピング…") : ___bsJa("typing…", "タイピング…")) : (selectedFriend.custom_status || `@${selectedFriend.username}`)}</small></div><button type="button" onClick={() => inspectProfile(selectedFriend)}>{pt ? ___bsJa("Perfil", "プロフィール") : ___bsJa("Profile", "プロフィール")}</button></header>
                      <div className="social-chat-messages">
                        {messages.map((message) => {
                          const mine = message.sender_id === sessionUser?.id;
                          return <article key={message.id} className={mine ? "mine" : "theirs"}><span>{message.text}</span><small>{formatTime(message.created_at, language)}{mine ? ` · ${message.read_at ? (language === "ja" ? "既読" : pt ? "Lida" : "Read") : (language === "ja" ? "送信済み" : pt ? "Enviada" : "Sent")}` : ""}</small></article>;
                        })}
                        {!messages.length && <div className="social-big-empty compact"><b>✦</b><strong>{pt ? ___bsJa("Comece a conversa", "会話を始めましょう") : ___bsJa("Start the conversation", "会話を始めましょう")}</strong></div>}
                      </div>
                      <form className="social-chat-compose" onSubmit={sendMessage}><input maxLength={1000} value={chatText} onChange={(event) => handleTypingChange(event.target.value)} placeholder={pt ? ___bsJa("Escreva uma mensagem...", "メッセージを書いてください...") : ___bsJa("Write a message...", "メッセージを書いてください...")} /><button type="submit">{pt ? ___bsJa("Enviar", "送信") : ___bsJa("Send", "送信")}</button></form>
                    </>
                  ) : <div className="social-big-empty"><b>✦</b><strong>{pt ? ___bsJa("Selecione um amigo", "友達を選択してください") : ___bsJa("Select a friend", "友達を選択してください")}</strong><span>{pt ? ___bsJa("A conversa privada aparecerá aqui.", "プライベートな会話がここに表示されます。") : ___bsJa("The private conversation will appear here.", "プライベートな会話がここに表示されます。")}</span></div>}
                </section>
              </div>
            </div>
          )}

          {section === "notifications" && (
            <div className="social-view social-notifications-view">
              <SocialSectionTitle eyebrow={___bsJa("NOTIFICATIONS", "通知")} title={pt ? ___bsJa("Central de notificações", "通知センター") : ___bsJa("Notification center", "通知センター")} description={pt ? ___bsJa("Pedidos, amizades aceitas e novas mensagens aparecem aqui.", "リクエスト、承認された友情、新しいメッセージがここに表示されます。") : ___bsJa("Requests, accepted friendships and new messages appear here.", "リクエスト、承認された友情、新しいメッセージがここに表示されます。")} action={notifications.length ? <button type="button" className="social-text-button" onClick={async () => { await markAllNotificationsRead(); await refreshSocial(); }}>{pt ? ___bsJa("Marcar tudo como lido", "すべて既読としてマークする") : ___bsJa("Mark all read", "すべて既読としてマークする")}</button> : null} />
              <div className="social-notification-list">
                {notifications.map((notification) => {
                  const actor = relatedPeople.get(notification.actor_id);
                  const text = notification.type === "friend_request" ? (language === "ja" ? "フレンド申請を送信しました。" : pt ? "enviou um pedido de amizade." : "sent you a friend request.") : notification.type === "friend_accepted" ? (language === "ja" ? "フレンド申請を承認しました。" : pt ? "aceitou seu pedido de amizade." : "accepted your friend request.") : notification.type === "message" ? (language === "ja" ? "新しいメッセージを送信しました。" : pt ? "enviou uma nova mensagem." : "sent a new message.") : (language === "ja" ? "新しい通知があります。" : pt ? "Nova atualização social." : "New social update.");
                  return <article key={notification.id} className={!notification.read_at ? "unread" : ""}><SocialAvatar person={actor || { display_name: "BS" }} /><div><strong>{actor ? personName(actor) : (pt ? ___bsJa("Battle Spirits", "バトルスピリッツ") : ___bsJa("Battle Spirits", "バトルスピリッツ"))}</strong><span>{text}</span><small>{formatTime(notification.created_at, language)}</small></div></article>;
                })}
                {!notifications.length && <div className="social-big-empty"><b>◇</b><strong>{pt ? ___bsJa("Tudo tranquilo por aqui", "ここではみんな静かに") : ___bsJa("All quiet here", "ここではみんな静かに")}</strong><span>{pt ? ___bsJa("Novas atividades sociais aparecerão nesta central.", "ここに新たな社会活動が生まれる。") : ___bsJa("New social activity will appear here.", "ここに新たな社会活動が生まれる。")}</span></div>}
              </div>
            </div>
          )}

          {section === "statistics" && (
            <div className="social-view social-statistics-view">
              <SocialSectionTitle
                eyebrow={___bsJa("MATCH HISTORY", "試合履歴")}
                title={pt ? ___bsJa("Histórico & Estatísticas", "歴史と統計") : ___bsJa("History & Statistics", "歴史と統計")}
                description={pt ? ___bsJa("Acompanhe seu desempenho, decks mais usados e partidas recentes.", "パフォーマンス、最も使用されたデッキ、最近の試合を追跡します。") : ___bsJa("Track your performance, most-used decks and recent matches.", "パフォーマンス、最も使用されたデッキ、最近の試合を追跡します。")}
                action={<span className="social-history-source">{pt ? ___bsJa("ATUALIZADO", "更新されました") : ___bsJa("UPDATED", "更新されました")}</span>}
              />

              <div className="social-match-stat-grid">
                <article><span>{pt ? ___bsJa("Partidas", "対戦数") : ___bsJa("Matches", "対戦数")}</span><strong>{matchStats.total}</strong><small>{pt ? ___bsJa("resultados registrados", "記録された結果") : ___bsJa("recorded results", "記録された結果")}</small></article>
                <article><span>{pt ? ___bsJa("Vitórias", "勝利") : ___bsJa("Wins", "勝利")}</span><strong>{matchStats.wins}</strong><small>{matchStats.total ? `${matchStats.winRate}% ${language === "ja" ? "の勝率" : pt ? "de aproveitamento" : "win rate"}` : "—"}</small></article>
                <article><span>{pt ? ___bsJa("Derrotas", "敗") : ___bsJa("Losses", "敗")}</span><strong>{matchStats.losses}</strong><small>{pt ? ___bsJa("histórico normal", "通常対戦の履歴") : ___bsJa("normal history", "通常対戦の履歴")}</small></article>
                <article><span>{pt ? ___bsJa("Duração média", "平均対戦時間") : ___bsJa("Average duration", "平均対戦時間")}</span><strong>{matchStats.averageDuration ? `${Math.floor(matchStats.averageDuration / 60)}m ${matchStats.averageDuration % 60}s` : "—"}</strong><small>{pt ? ___bsJa("tempo de duelo", "デュエルタイム") : ___bsJa("duel time", "デュエルタイム")}</small></article>
                <article><span>{pt ? ___bsJa("Deck mais usado", "最もよく使われるデッキ") : ___bsJa("Most used deck", "最もよく使われるデッキ")}</span><strong>{matchStats.favoriteDeck?.name || "—"}</strong><small>{matchStats.favoriteDeck ? `${matchStats.favoriteDeck.matches}x` : (pt ? ___bsJa("aguardando partidas", "試合を待っています") : ___bsJa("waiting for matches", "試合を待っています"))}</small></article>
                <article><span>{pt ? ___bsJa("Cor mais usada", "最もよく使われる色") : ___bsJa("Most used color", "最もよく使われる色")}</span><strong>{displayColor(matchStats.primaryColor, language)}</strong><small>{matchStats.favoriteMode ? `${language === "ja" ? "対戦形式" : pt ? "modo" : "mode"}: ${displayMode(matchStats.favoriteMode, language)}` : "—"}</small></article>
              </div>

              <section className="social-panel social-match-history-panel">
                <SocialSectionTitle eyebrow={___bsJa("RECENT MATCHES", "最近の試合")} title={pt ? ___bsJa("Partidas recentes", "最近の試合") : ___bsJa("Recent matches", "最近の試合")} description={pt ? ___bsJa("As partidas mais recentes registradas neste perfil.", "このプロフィールに記録された最新の試合。") : ___bsJa("The most recent matches recorded on this profile.", "このプロフィールに記録された最新の試合。")} />
                <div className="social-match-history-list">
                  {matchHistory.slice(0, 20).map((row) => (
                    <article key={row.match_uid}>
                      <span className={`social-match-result ${row.result === "win" ? "win" : "loss"}`}>{row.result === "win" ? (pt ? ___bsJa("VITÓRIA", "勝利") : ___bsJa("WIN", "勝利")) : (pt ? ___bsJa("DERROTA", "敗") : ___bsJa("LOSS", "敗"))}</span>
                      <div className="social-match-opponent">
                        <strong>{row.opponent_name || (pt ? ___bsJa("Oponente", "相手") : ___bsJa("Opponent", "相手"))}</strong>
                        <small>{row.opponent_username ? `@${row.opponent_username} · ` : ""}{row.mode === "ai" ? ___bsJa("ETERNAL CPU", "エターナルCPU") : row.mode === "online" ? ___bsJa("ONLINE", "オンライン") : (pt ? ___bsJa("LOCAL", "ローカル") : ___bsJa("LOCAL", "ローカル"))}</small>
                      </div>
                      <div className="social-match-deck">
                        <strong>{row.deck_name || (pt ? ___bsJa("Deck não identificado", "未確認のデッキ") : ___bsJa("Unidentified deck", "未確認のデッキ"))}</strong>
                        <small>{Array.isArray(row.deck_colors) && row.deck_colors.length ? row.deck_colors.map((color) => displayColor(color, language)).join("・") : (pt ? ___bsJa("sem cor registrada", "記録された色がありません") : ___bsJa("no recorded color", "記録された色がありません"))}</small>
                      </div>
                      <div className="social-match-meta">
                        <strong>{Math.floor(Number(row.duration_seconds || 0) / 60)}:{String(Number(row.duration_seconds || 0) % 60).padStart(2, "0")}</strong>
                        <small>{row.turns || 1} {pt ? ___bsJa("turnos", "ターン") : ___bsJa("turns", "ターン")} · {formatTime(row.played_at, language)}</small>
                      </div>
                    </article>
                  ))}
                  {!matchHistory.length && <div className="social-big-empty"><b>▥</b><strong>{pt ? ___bsJa("Nenhuma partida registrada", "試合は記録されていません") : ___bsJa("No matches recorded", "試合は記録されていません")}</strong><span>{pt ? ___bsJa("Finalize uma partida Local, contra a Eternal CPU ou Online para começar seu histórico.", "ローカル、エターナル CPU、またはオンライン マッチを終了すると、歴史が始まります。") : ___bsJa("Finish a Local, Eternal CPU or Online match to start your history.", "ローカル、エターナル CPU、またはオンライン マッチを終了すると、歴史が始まります。")}</span></div>}
                </div>
              </section>

              <section className="social-safety-card"><div><span>{pt ? ___bsJa("HISTÓRICO", "歴史") : ___bsJa("HISTORY", "歴史")}</span><h3>{pt ? ___bsJa("Seu desempenho em um só lugar", "あなたのパフォーマンスを 1 か所で") : ___bsJa("Your performance in one place", "あなたのパフォーマンスを 1 か所で")}</h3><p>{pt ? ___bsJa("Veja resultados recentes, taxa de vitória, decks favoritos e outras estatísticas das suas partidas.", "最近の結果、勝率、お気に入りのデッキ、その他の試合統計をご覧ください。") : ___bsJa("See recent results, win rate, favorite decks and other match statistics.", "最近の結果、勝率、お気に入りのデッキ、その他の試合統計をご覧ください。")}</p></div><strong>✓</strong></section>
            </div>
          )}

          {section === "competitive" && (
            <div className="social-view social-competitive-view">
              <SocialSectionTitle eyebrow={___bsJa("RANKED · SEASON 0", "ランク戦・シーズン0")} title={pt ? ___bsJa("Identidade competitiva", "ランク戦の成績") : ___bsJa("Competitive identity", "ランク戦の成績")} description={pt ? ___bsJa("Acompanhe seu Rank, RP, melhor marca da temporada e histórico competitivo.", "ランク、RP、シーズン最高記録、対戦履歴を確認できます。") : ___bsJa("Track your Rank, RP, season peak and competitive history.", "ランク、RP、シーズン最高記録、対戦履歴を確認できます。")} />
              {rankedProfile ? <>
                <section className={`social-competitive-hero rank-${rankTier}`}>
                  <div className="social-rank-emblem"><span>{rankedProfile.rank?.tier?.slice(0,1) || "R"}</span></div>
                  <div><span>{___bsJa("SEASON 0 / PRÉ-TEMPORADA", "シーズン0 / プレシーズン")}</span><h2>{rankedProfile.rank?.label}</h2><p>{rankedProfile.rp} RP</p></div>
                  <aside><span>{pt ? ___bsJa("Pico da temporada", "シーズンのピーク") : ___bsJa("Season peak", "シーズンのピーク")}</span><strong>{rankedProfile.peak_rp}</strong><small>{rankedProfile.rank?.label}</small></aside>
                </section>
                <div className="social-match-stat-grid competitive">
                  <article><span>{pt ? ___bsJa("Partidas Ranked", "ランクマッチ") : ___bsJa("Ranked matches", "ランクマッチ")}</span><strong>{rankedMatches}</strong><small>{___bsJa("Season 0", "シーズン0")}</small></article>
                  <article><span>{pt ? ___bsJa("Vitórias", "勝利") : ___bsJa("Wins", "勝利")}</span><strong>{rankedProfile.wins || 0}</strong><small>{rankedWinRate}{___bsJa("% win rate", "勝率%")}</small></article>
                  <article><span>{pt ? ___bsJa("Derrotas", "敗") : ___bsJa("Losses", "敗")}</span><strong>{rankedProfile.losses || 0}</strong><small>{pt ? ___bsJa("competitivo", "ランク対戦") : ___bsJa("competitive", "ランク対戦")}</small></article>
                  <article><span>{pt ? ___bsJa("Deck mais usado", "最もよく使われるデッキ") : ___bsJa("Most used deck", "最もよく使われるデッキ")}</span><strong>{rankedStats.favoriteDeck?.name || "—"}</strong><small>{rankedStats.favoriteDeck ? `${rankedStats.favoriteDeck.matches}x` : (pt ? ___bsJa("a partir da v3.7.1", "v3.7.1以降") : ___bsJa("from v3.7.1 onward", "v3.7.1以降"))}</small></article>
                </div>
                <section className="social-panel social-ranked-history-panel">
                  <SocialSectionTitle eyebrow={___bsJa("COMPETITIVE HISTORY", "競争の歴史")} title={pt ? ___bsJa("Histórico Ranked", "ランキング履歴") : ___bsJa("Ranked history", "ランキング履歴")} description={pt ? ___bsJa("Variação de RP e adversários das partidas competitivas recentes.", "最近の対戦での RP の変更と対戦相手。") : ___bsJa("RP changes and opponents from recent competitive matches.", "最近の対戦での RP の変更と対戦相手。")} />
                  <div className="social-ranked-history-list">
                    {rankedHistory.slice(0,20).map((row) => <article key={row.match_uid} className={row.result}>
                      <b>{row.result === "win" ? (pt ? ___bsJa("VITÓRIA", "勝利") : ___bsJa("WIN", "勝利")) : (pt ? ___bsJa("DERROTA", "敗") : ___bsJa("LOSS", "敗"))}</b>
                      <div><strong>{row.opponent_name || (pt ? ___bsJa("Oponente", "相手") : ___bsJa("Opponent", "相手"))}</strong><small>{row.opponent_username ? `@${row.opponent_username}` : formatTime(row.played_at, language)}</small></div>
                      <div><strong>{row.deck_name || (pt ? ___bsJa("Deck não registrado", "デッキは記録されていません") : ___bsJa("Deck not recorded", "デッキは記録されていません"))}</strong><small>{row.end_reason === "forfeit" ? (pt ? ___bsJa("abandono", "投了") : ___bsJa("forfeit", "投了")) : ___bsJa("Season 0", "シーズン0")}</small></div>
                      <em>{Number(row.rp_delta) >= 0 ? "+" : ""}{row.rp_delta} RP</em>
                    </article>)}
                    {!rankedHistory.length && <div className="social-big-empty"><b>♢</b><strong>{pt ? ___bsJa("Sem partidas Ranked ainda", "まだランクマッチはありません") : ___bsJa("No Ranked matches yet", "まだランクマッチはありません")}</strong><span>{pt ? ___bsJa("As próximas partidas da Season 0 aparecerão aqui.", "次のシーズン 0 の試合がここに表示されます。") : ___bsJa("Your next Season 0 matches will appear here.", "次のシーズン 0 の試合がここに表示されます。")}</span></div>}
                  </div>
                </section>
              </> : <div className="social-big-empty"><b>♢</b><strong>{pt ? ___bsJa("Identidade competitiva indisponível", "ランク戦の成績を表示できません") : ___bsJa("Competitive identity unavailable", "ランク戦の成績を表示できません")}</strong><span>{pt ? ___bsJa("Entre na sua conta para acessar seus dados competitivos.", "ログインするとランク戦の成績を確認できます。") : ___bsJa("Sign in to access your competitive data.", "ログインするとランク戦の成績を確認できます。")}</span></div>}
            </div>
          )}

          {section === "mastery" && (
            <div className="social-view social-mastery-view">
              <SocialSectionTitle eyebrow={___bsJa("CARD MASTERY 2.0", "カードマスタリー 2.0")} title={pt ? ___bsJa("Maestria de cartas", "カードマスタリー") : ___bsJa("Card Mastery", "カードマスタリー")} description={pt ? ___bsJa("Agora a progressão vem das cartas presentes no deck realmente usado em partidas finalizadas. Cada partida concede XP; vitórias e a carta de capa concedem bônus.", "進行状況は、終了した試合で実際に使用されたデッキ内のカードから得られます。各試合では XP が付与され、勝利とデッキ カバー カードに対するボーナスが付与されます。") : ___bsJa("Progress now comes from cards in the deck actually used in finished matches. Each match grants XP, with bonuses for wins and the deck cover card.", "進行状況は、終了した試合で実際に使用されたデッキ内のカードから得られます。各試合では XP が付与され、勝利とデッキ カバー カードに対するボーナスが付与されます。")} />
              <div className="social-mastery-summary"><article><span>{pt ? ___bsJa("Líder", "リーダー") : ___bsJa("Leader", "リーダー")}</span><strong>{masteryStats.leader?.name || "—"}</strong><small>{masteryStats.leader ? formatMasteryLabel(masteryStats.leader.level, language) : "—"}</small></article><article><span>{pt ? ___bsJa("Cartas rastreadas", "追跡カード") : ___bsJa("Tracked cards", "追跡カード")}</span><strong>{masteryStats.trackedCards}</strong><small>{masteryStats.totalXp}{___bsJa(" XP ", " 経験値 ")}{pt ? ___bsJa("acumulado", "稼いだ") : ___bsJa("earned", "稼いだ")}</small></article><article><span>{pt ? ___bsJa("Maior nível", "最高レベル") : ___bsJa("Highest level", "最高レベル")}</span><strong>{masteryStats.maxLevel ? formatMasteryLabel(masteryStats.maxLevel, language) : "—"}</strong><small>{pt ? ___bsJa("progresso de Maestria", "マスタリーの進捗状況") : ___bsJa("Mastery progress", "マスタリーの進捗状況")}</small></article></div>
              <div className="social-mastery-rules"><span>{___bsJa("XP", "経験値")}</span><b>+40 {pt ? ___bsJa("por partida", "試合ごとに") : ___bsJa("per match", "試合ごとに")}</b><b>+20 {pt ? ___bsJa("por vitória", "勝利あたり") : ___bsJa("per win", "勝利あたり")}</b><b>+15 {pt ? ___bsJa("se for carta de capa", "カバーとして使用する場合") : ___bsJa("when used as cover", "カバーとして使用する場合")}</b><small>{pt ? ___bsJa("Uma carta recebe XP no máximo uma vez por partida, independentemente da quantidade de cópias no deck.", "カードは、デッキ内の枚数に関係なく、試合ごとに最大 1 回 XP を受け取ります。") : ___bsJa("A card receives XP at most once per match, regardless of how many copies are in the deck.", "カードは、デッキ内の枚数に関係なく、試合ごとに最大 1 回 XP を受け取ります。")}</small></div>
              <div className="social-mastery-grid">
                {masteryRows.map((entry) => <MasteryCard key={entry.id} entry={entry} language={language} onClick={setSelectedMastery} />)}
                {!masteryRows.length && <div className="social-big-empty"><b>◆</b><strong>{pt ? ___bsJa("Maestria ainda vazia", "マスタリーは空です") : ___bsJa("Mastery is empty", "マスタリーは空です")}</strong><span>{pt ? ___bsJa("Finalize uma partida usando um deck salvo para registrar as cartas e começar a ganhar XP.", "保存したデッキを使用して試合を終了し、そのカードを登録し、XP の獲得を開始します。") : ___bsJa("Finish a match using a saved deck to register its cards and start earning XP.", "保存したデッキを使用して試合を終了し、そのカードを登録し、XP の獲得を開始します。")}</span></div>}
              </div>
            </div>
          )}

          {section === "privacy" && (
            <div className="social-view social-privacy-view">
              <SocialSectionTitle eyebrow={___bsJa("PRIVACY & SAFETY", "プライバシーと安全性")} title={pt ? ___bsJa("Privacidade do jogador", "プレーヤーのプライバシー") : ___bsJa("Player privacy", "プレーヤーのプライバシー")} description={pt ? ___bsJa("Defina quem pode encontrar, ver e interagir com seu perfil.", "あなたのプロフィールを検索、表示、操作できる人を選択します。") : ___bsJa("Choose who can find, view and interact with your profile.", "あなたのプロフィールを検索、表示、操作できる人を選択します。")} />

              <div className="social-privacy-grid">
                <section className="social-panel">
                  <h3>{pt ? ___bsJa("Visibilidade e contato", "可視性と連絡先") : ___bsJa("Visibility & contact", "可視性と連絡先")}</h3>
                  <PrivacySelect title={pt ? ___bsJa("Visibilidade do perfil", "プロフィールの公開範囲") : ___bsJa("Profile visibility", "プロフィールの公開範囲")} description={pt ? ___bsJa("Controla bio, banner e detalhes públicos.", "プロフィール、バナー、公開詳細を制御します。") : ___bsJa("Controls bio, banner and public details.", "プロフィール、バナー、公開詳細を制御します。")} value={privacy.profileVisibility} onChange={(value) => setProfile({ ...profile, privacy: { ...privacy, profileVisibility: value } })} options={[{ value: "public", label: pt ? "Público" : "Public" }, { value: "friends", label: pt ? "Somente amigos" : "Friends only" }, { value: "private", label: pt ? "Privado" : "Private" }]} disabled={!schema.ready && accountsEnabled} />
                  <PrivacySelect title={pt ? ___bsJa("Pedidos de amizade", "友達リクエスト") : ___bsJa("Friend requests", "友達リクエスト")} description={pt ? ___bsJa("Quem pode enviar novos pedidos.", "新しいリクエストを送信できる人。") : ___bsJa("Who may send new requests.", "新しいリクエストを送信できる人。")} value={privacy.friendRequestPolicy} onChange={(value) => setProfile({ ...profile, privacy: { ...privacy, friendRequestPolicy: value } })} options={[{ value: "everyone", label: pt ? "Todos" : "Everyone" }, { value: "mutuals", label: pt ? "Amigos em comum" : "Mutual friends" }, { value: "nobody", label: pt ? "Ninguém" : "Nobody" }]} disabled={!schema.ready && accountsEnabled} />
                  <PrivacySelect title={pt ? ___bsJa("Mensagens privadas", "プライベートメッセージ") : ___bsJa("Private messages", "プライベートメッセージ")} description={pt ? ___bsJa("Quem pode iniciar uma conversa com você.", "メッセージを送信できる人を選びます。") : ___bsJa("Who may start a conversation with you.", "メッセージを送信できる人を選びます。")} value={privacy.messagePolicy} onChange={(value) => setProfile({ ...profile, privacy: { ...privacy, messagePolicy: value } })} options={[{ value: "friends", label: pt ? "Somente amigos" : "Friends only" }, { value: "everyone", label: pt ? "Todos" : "Everyone" }, { value: "nobody", label: pt ? "Ninguém" : "Nobody" }]} disabled={!schema.ready && accountsEnabled} />
                </section>

                <section className="social-panel">
                  <h3>{pt ? ___bsJa("Dados exibidos", "表示データ") : ___bsJa("Displayed data", "表示データ")}</h3>
                  <ToggleRow title={pt ? ___bsJa("Aparecer nas buscas", "検索に表示される") : ___bsJa("Appear in search", "検索に表示される")} description={pt ? ___bsJa("Permite que outros jogadores encontrem seu @usuário.", "他のプレイヤーがあなたの @ユーザー名を見つけられるようにします。") : ___bsJa("Allows other players to find your @username.", "他のプレイヤーがあなたの @ユーザー名を見つけられるようにします。")} checked={privacy.discoverable} onChange={(value) => setProfile({ ...profile, privacy: { ...privacy, discoverable: value } })} disabled={!schema.ready && accountsEnabled} />
                  <ToggleRow title={pt ? ___bsJa("Mostrar status Online", "オンラインステータスを表示") : ___bsJa("Show Online status", "オンラインステータスを表示")} description={pt ? ___bsJa("Amigos podem ver quando você está no Social Hub.", "フレンドにオンライン状態を表示します。") : ___bsJa("Friends can see when you are in Social Hub.", "フレンドにオンライン状態を表示します。")} checked={privacy.showOnlineStatus} onChange={(value) => setProfile({ ...profile, privacy: { ...privacy, showOnlineStatus: value } })} disabled={!schema.ready && accountsEnabled} />
                  <ToggleRow title={pt ? ___bsJa("Mostrar estatísticas", "統計を表示する") : ___bsJa("Show statistics", "統計を表示する")} checked={privacy.showStats} onChange={(value) => setProfile({ ...profile, privacy: { ...privacy, showStats: value } })} disabled={!schema.ready && accountsEnabled} />
                  <ToggleRow title={pt ? ___bsJa("Mostrar decks", "デッキを表示する") : ___bsJa("Show decks", "デッキを表示する")} checked={privacy.showDecks} onChange={(value) => setProfile({ ...profile, privacy: { ...privacy, showDecks: value } })} disabled={!schema.ready && accountsEnabled} />
                  <ToggleRow title={pt ? ___bsJa("Mostrar Maestria", "マスタリーを表示") : ___bsJa("Show Mastery", "マスタリーを表示")} checked={privacy.showMastery} onChange={(value) => setProfile({ ...profile, privacy: { ...privacy, showMastery: value } })} disabled={!schema.ready && accountsEnabled} />
                </section>
              </div>

              <section className="social-safety-card"><div><span>{pt ? ___bsJa("CONTROLE DE PRIVACIDADE", "プライバシー管理") : ___bsJa("PRIVACY CONTROL", "プライバシー管理")}</span><h3>{pt ? ___bsJa("Você decide o que compartilhar", "何を共有するかを決めるのはあなたです") : ___bsJa("You decide what to share", "何を共有するかを決めるのはあなたです")}</h3><p>{pt ? ___bsJa("Ajuste a visibilidade do perfil, mensagens, buscas, estatísticas, decks e Maestria a qualquer momento.", "プロフィールの公開設定、メッセージ、検索、統計、デッキ、マスタリーをいつでも調整できます。") : ___bsJa("Adjust profile visibility, messages, search, statistics, decks and Mastery at any time.", "プロフィールの公開設定、メッセージ、検索、統計、デッキ、マスタリーをいつでも調整できます。")}</p></div><strong>✓</strong></section>

              {blocked.length > 0 && <section className="social-panel social-blocked-panel"><h3>{pt ? ___bsJa("Jogadores bloqueados", "ブロックされたプレイヤー") : ___bsJa("Blocked players", "ブロックされたプレイヤー")}</h3>{blocked.map((person) => <article key={personId(person)}><SocialAvatar person={person} size="small" /><span><strong>{personName(person)}</strong><small>@{person.username}</small></span><button type="button" onClick={() => handleUnblock(person)}>{pt ? ___bsJa("Desbloquear", "ブロックを解除する") : ___bsJa("Unblock", "ブロックを解除する")}</button></article>)}</section>}
              <footer className="social-view-actions"><span>{pt ? ___bsJa("Suas preferências de privacidade", "あなたのプライバシー設定") : ___bsJa("Your privacy preferences", "あなたのプライバシー設定")}</span><button type="button" className="eternal-menu-action active" onClick={savePrivacy}>{pt ? ___bsJa("Salvar privacidade", "プライバシー設定を保存") : ___bsJa("Save privacy", "プライバシー設定を保存")}</button></footer>
            </div>
          )}
        </section>

        <FriendDock friends={friends} friendRanks={friendRanks} pt={pt} onChat={openChat} onManage={() => setSection("friends")} />
      </section>

      {remoteProfile && (
        <div className="social-profile-preview-backdrop" onMouseDown={(event) => event.target === event.currentTarget && setRemoteProfile(null)}>
          <section className="social-profile-preview" style={remoteProfile.banner ? { backgroundImage: `linear-gradient(180deg,rgba(0,0,0,.22),rgba(0,0,0,.92)),url(${remoteProfile.banner})` } : undefined}>
            <button type="button" className="social-profile-preview-close" onClick={() => setRemoteProfile(null)}>×</button>
            <SocialAvatar person={remoteProfile} size="hero" />
            <span>{remoteProfile.can_view === false ? (pt ? ___bsJa("PERFIL PRIVADO", "プライベートプロフィール") : ___bsJa("PRIVATE PROFILE", "プライベートプロフィール")) : ___bsJa("PLAYER PROFILE", "選手プロフィール")}</span>
            <h2>{personName(remoteProfile)}</h2>
            <small>@{remoteProfile.username}</small>
            {remoteProfile.ranked && <div className={`social-rank-badge remote rank-${String(remoteProfile.ranked.rank?.tier || "unranked").toLowerCase()}`}><b>{remoteProfile.ranked.rank?.label}</b><span>{remoteProfile.ranked.rp}{___bsJa(" RP · Season 0", " RP・シーズン0")}</span></div>}
            <p>{remoteProfile.bio || (remoteProfile.can_view === false ? (pt ? ___bsJa("Este jogador limitou a visualização do perfil.", "このプレーヤーはプロフィールの公開範囲を制限していました。") : ___bsJa("This player limited profile visibility.", "このプレーヤーはプロフィールの公開範囲を制限していました。")) : "")}</p>
            <div className="social-profile-preview-actions">
              {(remoteProfile.is_friend || remoteProfile.can_message) && <button type="button" onClick={() => { openChat(remoteProfile); setRemoteProfile(null); }}>{pt ? ___bsJa("Mensagem", "メッセージ") : ___bsJa("Message", "メッセージ")}</button>}
              {remoteProfile.is_friend && <button type="button" onClick={() => handleRemoveFriend(remoteProfile)}>{pt ? ___bsJa("Remover amigo", "友達を削除する") : ___bsJa("Remove friend", "友達を削除する")}</button>}
              <button type="button" className="danger" onClick={() => handleBlock(remoteProfile)}>{pt ? ___bsJa("Bloquear", "ブロック") : ___bsJa("Block", "ブロック")}</button>
            </div>
          </section>
        </div>
      )}


      {selectedMastery && (() => {
        const next = selectedMastery.nextPoints;
        const currentFloor = Math.max(0, Number(selectedMastery.level > 1 ? [0,250,650,1300,2300,3800,6000][selectedMastery.level - 1] : 0));
        const progress = next ? Math.max(0, Math.min(100, ((selectedMastery.xp - currentFloor) / Math.max(1, next - currentFloor)) * 100)) : 100;
        const winRate = selectedMastery.matches ? Math.round((selectedMastery.wins / selectedMastery.matches) * 100) : 0;
        return <div className="social-profile-preview-backdrop" onMouseDown={(event) => event.target === event.currentTarget && setSelectedMastery(null)}>
          <section className="social-mastery-detail">
            <button type="button" className="social-profile-preview-close" onClick={() => setSelectedMastery(null)}>×</button>
            <div className="social-mastery-detail-art">{selectedMastery.image ? <img src={selectedMastery.image} alt="" /> : <b>{getInitials(selectedMastery.name)}</b>}</div>
            <div className="social-mastery-detail-copy">
              <span>{___bsJa("CARD MASTERY 2.0", "カードマスタリー 2.0")}</span><h2>{selectedMastery.name}</h2><small>{selectedMastery.cardId}</small>
              <div className="social-mastery-level-line"><strong>{formatMasteryLabel(selectedMastery.level, language)}</strong><b>{selectedMastery.xp}{___bsJa(" XP", " 経験値")}</b></div>
              <div className="social-mastery-progress"><i style={{ width: `${progress}%` }} /></div>
              <p>{next ? `${next - selectedMastery.xp} XP ${language === "ja" ? "で次のレベルへ" : pt ? "para o próximo nível" : "to the next level"}` : (pt ? ___bsJa("Nível máximo alcançado", "最大レベルに到達しました") : ___bsJa("Maximum level reached", "最大レベルに到達しました"))}</p>
              <div className="social-mastery-detail-stats"><article><span>{pt ? ___bsJa("Partidas", "対戦数") : ___bsJa("Matches", "対戦数")}</span><strong>{selectedMastery.matches}</strong></article><article><span>{pt ? ___bsJa("Vitórias", "勝利") : ___bsJa("Wins", "勝利")}</span><strong>{selectedMastery.wins}</strong><small>{winRate}%</small></article><article><span>{pt ? ___bsJa("Carta de capa", "カバーカード") : ___bsJa("Cover card", "カバーカード")}</span><strong>{selectedMastery.coverMatches}</strong></article></div>
            </div>
          </section>
        </div>;
      })()}
    </main>
  );
}
