import { useEffect, useMemo, useState } from "react";
import { getProfile } from "../../services/platform/storage.js";
import { useLanguage } from "../../localization/i18n.jsx";
import { APP_VERSION_LABEL } from "../../app/config/app-version.js";
import HomeWallpaperSlideshow from "../../components/layout/HomeWallpaperSlideshow.jsx";
import ProjectInfoButtons from "../../components/common/ProjectInfoButtons.jsx";
import { dismissTutorialWelcome, getTutorialProgress } from "../../services/tutorial/tutorialProgress.js";
import "../../styles/pages/mainMenuV340.css";

function playerName(profile, language) {
  const value = String(profile?.displayName || profile?.name || "").trim();
  if (value) return value;
  return language === "ja" ? "プレイヤー" : language === "en" ? "Player" : "Jogador";
}

function initials(value) {
  const words = String(value || "Player").trim().split(/\s+/).filter(Boolean);
  if (!words.length) return "P";
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return `${words[0][0]}${words[words.length - 1][0]}`.toUpperCase();
}

function MainMenuItem({ label, detail, badge, onClick, disabled = false }) {
  return (
    <button
      type="button"
      className="bs-main-menu-item"
      onClick={onClick}
      disabled={disabled}
    >
      <span className="bs-main-menu-selector" aria-hidden="true" />
      <span className="bs-main-menu-label">{label}</span>
      {detail && <small>{detail}</small>}
      {badge && <em>{badge}</em>}
    </button>
  );
}

export default function Home({ go, initialSection = "root" }) {
  const { language } = useLanguage();
  const pt = language !== "en";
  const text = (ja, portuguese, english) => language === "ja" ? ja : pt ? portuguese : english;
  const profile = useMemo(() => getProfile() || {}, []);
  const name = playerName(profile, language);
  const [section, setSection] = useState(initialSection || "root");
  const tutorialProgress = useMemo(() => getTutorialProgress(), []);
  const tutorialComplete = tutorialProgress.practiceCompleted && tutorialProgress.completed.length >= 6;
  const [tutorialWelcome, setTutorialWelcome] = useState(() => !tutorialProgress.dismissedWelcome);

  useEffect(() => {
    setSection(initialSection || "root");
  }, [initialSection]);


  const rootMenu = (
    <>
      <MainMenuItem
        label={text("遊び方", "Aprenda a Jogar", "Learn to Play")}
        detail={tutorialComplete
          ? text("チュートリアルを確認", "Rever tutorial e consulta rápida", "Review tutorial and quick reference")
          : text("エターナルの基本ルール", "Tutorial rápido · Regras Eternal", "Quick tutorial · Eternal rules")}
        badge={tutorialComplete ? null : text("未完了", "NOVO", "NEW")}
        onClick={() => { dismissTutorialWelcome(); setTutorialWelcome(false); go("tutorial"); }}
      />
      <MainMenuItem
        label={text("ローカル対戦", "Partida Local", "Local Match")}
        detail={text("CPU 対戦・ひとりで両側を操作", "Jogo Livre ou Eternal CPU", "Free Play or Eternal CPU")}
        onClick={() => setSection("local")}
      />
      <MainMenuItem
        label={text("オンライン対戦", "Multiplayer Online", "Online Multiplayer")}
        detail={text("通常対戦・ランク対戦", "Normal ou Ranqueada", "Normal or Ranked")}
        onClick={() => setSection("online")}
      />
      <MainMenuItem
        label={text("ショップ", "Loja", "Store")}
        detail={text("パック・デッキ・コレクション", "Boosters, coleção e economia", "Boosters, collection and economy")}
        onClick={() => go("store")}
      />
      <MainMenuItem
        label={text("デッキ構築", "Deck Builder", "Deck Builder")}
        detail={text("デッキの作成・編集", "Criar e gerenciar decks", "Create and manage decks")}
        onClick={() => go("decks")}
      />
      <MainMenuItem
        label={text("設定", "Configurações", "Settings")}
        detail={text("画面・言語", "Sistema, tema e idioma", "System, theme and language")}
        onClick={() => go("settings")}
      />
    </>
  );

  const localMenu = (
    <>
      <MainMenuItem
        label={text("フリープレイ", "Jogo Livre", "Free Play")}
        detail={text("両プレイヤーを操作", "Controle os dois lados da mesa", "Control both sides of the table")}
        onClick={() => go("local")}
      />
      <MainMenuItem
        label={text("CPU 対戦", "Eternal CPU", "Eternal CPU")}
        detail={text("CPU と対戦", "Jogue contra a IA em Fácil, Normal ou Difícil", "Play the AI on Easy, Normal or Hard")}
        onClick={() => go("ai")}
      />
      <MainMenuItem
        label={text("戻る", "Voltar", "Back")}
        onClick={() => setSection("root")}
      />
    </>
  );

  const onlineMenu = (
    <>
      <MainMenuItem
        label={text("通常対戦", "Partida Normal", "Normal Match")}
        detail={text("マッチング・ルーム対戦", "Matchmaking rápido, sala privada ou código", "Quick match, private room or room code")}
        onClick={() => go("online")}
      />
      <MainMenuItem
        label={text("ランク対戦", "Partida Ranqueada", "Ranked Match")}
        detail={text("シーズン 0", "Season 0 · Bronze ao Master", "Season 0 · Bronze to Master")}
        badge={text("プレシーズン", "PRÉ-TEMPORADA", "PRE-SEASON")}
        onClick={() => go("ranked")}
      />
      <MainMenuItem
        label={text("戻る", "Voltar", "Back")}
        onClick={() => setSection("root")}
      />
    </>
  );

  const heading = section === "local"
    ? text("ローカル対戦", "PARTIDA LOCAL", "LOCAL MATCH")
    : section === "online"
      ? text("オンライン対戦", "MULTIPLAYER ONLINE", "ONLINE MULTIPLAYER")
      : "GATE OPEN";

  return (
    <main className="bs-main-menu">
      <HomeWallpaperSlideshow />
      <div className="bs-main-menu-gradient" aria-hidden="true" />
      <div className="bs-main-menu-grain" aria-hidden="true" />

      <header className="bs-main-menu-account">
        <button type="button" className="bs-account-chip" onClick={() => go("account")}>
          <span className="bs-account-avatar">
            {profile.avatar ? <img src={profile.avatar} alt="" /> : initials(name)}
          </span>
          <span className="bs-account-copy">
            <strong>{name}</strong>
            <small>{text("アカウント", "Conta & Social Hub", "Account & Social Hub")}</small>
          </span>
        </button>

        <div className="bs-main-menu-info">
          <ProjectInfoButtons />
        </div>
      </header>

      <section className="bs-main-menu-shell" aria-label={text("メインメニュー", "Menu principal", "Main menu")}>
        <div className="bs-main-menu-brand">
          <img src="./images/logo_battlespirits.png" alt="Battle Spirits: KAIHOU! Simulator" />

          <div className={`bs-main-menu-title ${section !== "root" ? "is-submenu" : ""}`}>
            <span>{heading}</span>
            {section === "root" ? <strong>KAIHOU!</strong> : <strong>{text("対戦方法を選ぶ", "SELECT", "SELECT")}</strong>}
          </div>
        </div>

        <nav className="bs-main-menu-nav" key={section}>
          {section === "local" ? localMenu : section === "online" ? onlineMenu : rootMenu}
        </nav>
      </section>


      {tutorialWelcome && section === "root" && (
        <section className="bs-tutorial-welcome" role="dialog" aria-label={text("遊び方", "Boas-vindas", "Welcome")}>
          <div>
            <span className="eyebrow">{text("バトスピの遊び方", "NOVO NO BATTLE SPIRITS?", "NEW TO BATTLE SPIRITS?")}</span>
            <strong>{text("基本ルールを確認できます。", "Aprenda o básico em poucos minutos.", "Learn the basics in a few minutes.")}</strong>
            <small>{text("ターンの進行、コア、アタック、ブロックを学びます。", "Turnos, Cores, ataques, bloqueios e Flash sem enrolação.", "Turns, Cores, attacks, blocks and Flash — straight to the point.")}</small>
          </div>
          <div className="bs-tutorial-welcome-actions">
            <button type="button" className="primary" onClick={() => { dismissTutorialWelcome(); setTutorialWelcome(false); go("tutorial"); }}>{text("遊び方を見る", "Começar tutorial", "Start tutorial")}</button>
            <button type="button" className="ghost" onClick={() => { dismissTutorialWelcome(); setTutorialWelcome(false); }}>{text("閉じる", "Já sei jogar", "I already know")}</button>
          </div>
        </section>
      )}

      <footer className="bs-main-menu-footer">
        <span>Battle Spirits © BANDAI.</span>
        <span className="bs-main-menu-footer-line" aria-hidden="true" />
        <strong>{text("非公式シミュレーター", "SIMULADOR NÃO OFICIAL", "UNOFFICIAL SIMULATOR")} · {APP_VERSION_LABEL}</strong>
      </footer>
    </main>
  );
}
