import { japaneseText as ___bsJa, isJapaneseDisplay as ___bsJapanese } from "../../localization/displayLanguage.js";
import EternalCinematicBackdrop from "../../components/layout/EternalCinematicBackdrop.jsx";
import {
  useEffect,
  useMemo,
  useState
} from "react";

import {
  getSettings,
  saveSettings
} from "../../services/platform/storage.js";

import {
  applyTheme,
  DEFAULT_THEME,
  normalizeTheme,
  RECOMMENDED_THEMES
} from "../../services/platform/theme.js";

import {
  useLanguage
} from "../../localization/i18n.jsx";

import { getAdminAccess } from "./services/adminService.js";
import { APP_VERSION_LABEL } from "../../app/config/app-version.js";
import "../../styles/theme/themeLibrary.css";
import "../../styles/pages/settingsGame.css";
import "../../styles/pages/eternalInterfaceV350.css";




const THEME_FIELDS = [
  [
    "bg",
    "Fundo",
    "Background"
  ],

  [
    "panel",
    "Painel",
    "Panel"
  ],

  [
    "panel2",
    "Painel secundário",
    "Secondary panel"
  ],

  [
    "text",
    "Texto",
    "Text"
  ],

  [
    "muted",
    "Texto secundário",
    "Secondary text"
  ],

  [
    "accent",
    "Destaque",
    "Accent"
  ],

  [
    "accent2",
    "Destaque 2",
    "Accent 2"
  ],

  [
    "danger",
    "Perigo",
    "Danger"
  ],

  [
    "ok",
    "Sucesso",
    "Success"
  ]
];


function normalizeSavedThemes(
  savedThemes
) {
  if (
    !Array.isArray(
      savedThemes
    )
  ) {
    return [];
  }

  return savedThemes
    .filter(
      (item) =>
        item &&
        item.id &&
        item.name
    )
    .map(
      (item) => ({
        ...item,

        theme:
          normalizeTheme(
            item.theme
          )
      })
    );
}


function ThemeSwatches({
  theme
}) {
  const normalized =
    normalizeTheme(
      theme
    );

  const colors = [
    normalized.bg,
    normalized.panel,
    normalized.accent,
    normalized.accent2,
    normalized.text
  ];


  return (
    <div className="theme-swatches">
      {colors.map(
        (
          color,
          index
        ) => (
          <i
            key={
              `${color}-${index}`
            }

            style={{
              background:
                color
            }}
          />
        )
      )}
    </div>
  );
}


export default function Settings({
  onBack,
  onAdmin
}) {
  const {
    t,
    language,
    setLanguage
  } = useLanguage();


  const initialSettings =
    useMemo(
      () =>
        getSettings(),
      []
    );


  const [
    draft,
    setDraft
  ] = useState(
    () => ({
      ...initialSettings,

      language,

      theme:
        normalizeTheme(
          initialSettings.theme
        ),

      savedThemes:
        normalizeSavedThemes(
          initialSettings.savedThemes
        ),

      activeThemeId:
        initialSettings.activeThemeId ||
        null
    })
  );


  const [
    themeName,
    setThemeName
  ] = useState(
    ""
  );


  const [
    saved,
    setSaved
  ] = useState(
    false
  );


  const [
    themeNotice,
    setThemeNotice
  ] = useState(
    ""
  );


  const [
    activeTab,
    setActiveTab
  ] = useState(
    "general"
  );

  const [adminAllowed, setAdminAllowed] = useState(false);

  useEffect(() => {
    let active = true;
    getAdminAccess().then((result) => {
      if (active) setAdminAllowed(Boolean(result?.allowed));
    }).catch(() => {});
    return () => { active = false; };
  }, []);


  function showThemeNotice(
    message
  ) {
    setThemeNotice(
      message
    );

    window.setTimeout(
      () =>
        setThemeNotice(
          ""
        ),
      2200
    );
  }


  async function apply() {
    const next = {
      ...getSettings(),
      ...draft,

      theme:
        normalizeTheme(
          draft.theme
        ),

      savedThemes:
        normalizeSavedThemes(
          draft.savedThemes
        )
    };


    saveSettings(
      next
    );

    setLanguage(
      next.language
    );

    applyTheme(
      next.theme
    );


    setSaved(
      true
    );

    window.setTimeout(
      () =>
        setSaved(
          false
        ),
      1800
    );
  }


  function setTheme(
    key,
    value
  ) {
    const theme = {
      ...normalizeTheme(
        draft.theme
      ),

      [key]:
        value
    };


    const keepCustomThemeId =
      String(
        draft.activeThemeId ||
        ""
      ).startsWith(
        "custom:"
      );


    setDraft({
      ...draft,
      theme,
      activeThemeId:
        keepCustomThemeId
          ? draft.activeThemeId
          : null
    });


    applyTheme(
      theme
    );
  }


  function resetTheme() {
    const theme = {
      ...DEFAULT_THEME
    };


    setDraft({
      ...draft,
      theme,
      activeThemeId:
        "recommended:eternal"
    });


    applyTheme(
      theme
    );
  }


  function persistThemeSelection(
    theme,
    activeThemeId
  ) {
    const normalized =
      normalizeTheme(
        theme
      );


    const nextDraft = {
      ...draft,

      theme:
        normalized,

      activeThemeId
    };


    setDraft(
      nextDraft
    );


    applyTheme(
      normalized
    );


    saveSettings({
      ...getSettings(),

      theme:
        normalized,

      activeThemeId,

      savedThemes:
        normalizeSavedThemes(
          draft.savedThemes
        )
    });
  }


  function applyRecommendedTheme(
    preset
  ) {
    persistThemeSelection(
      preset.theme,
      `recommended:${preset.id}`
    );


    showThemeNotice(
      language === "ja" ? `${preset.name.ja}を適用しました。` : language === "en"
        ? `${preset.name.en} applied.`
        : `${preset.name.ptBR} aplicado.`
    );
  }


  function saveCurrentTheme() {
    const name =
      themeName.trim();


    if (!name) {
      showThemeNotice(
        language === "ja" ? "テーマ名を入力してください。" : language === "en"
          ? "Choose a name for the theme first."
          : "Escolha um nome para o tema primeiro."
      );

      return;
    }


    const now =
      new Date()
        .toISOString();


    const id =
      `custom:${Date.now()}`;


    const item = {
      id,
      name,

      theme:
        normalizeTheme(
          draft.theme
        ),

      createdAt:
        now,

      updatedAt:
        now
    };


    const savedThemes = [
      ...normalizeSavedThemes(
        draft.savedThemes
      ),
      item
    ];


    const nextDraft = {
      ...draft,
      savedThemes,
      activeThemeId:
        id
    };


    setDraft(
      nextDraft
    );


    saveSettings({
      ...getSettings(),

      theme:
        normalizeTheme(
          draft.theme
        ),

      savedThemes,
      activeThemeId:
        id
    });


    setThemeName(
      ""
    );


    showThemeNotice(
      language === "ja" ? `「${name}」を保存しました。` : language === "en"
        ? `"${name}" saved.`
        : `"${name}" salvo.`
    );
  }


  function applyCustomTheme(
    item
  ) {
    persistThemeSelection(
      item.theme,
      item.id
    );


    showThemeNotice(
      language === "ja" ? `「${item.name}」を適用しました。` : language === "en"
        ? `${item.name} applied.`
        : `${item.name} aplicado.`
    );
  }


  function updateActiveCustomTheme() {
    if (
      !String(
        draft.activeThemeId ||
        ""
      ).startsWith(
        "custom:"
      )
    ) {
      return;
    }


    const now =
      new Date()
        .toISOString();


    const savedThemes =
      normalizeSavedThemes(
        draft.savedThemes
      )
        .map(
          (item) =>
            item.id ===
            draft.activeThemeId
              ? {
                  ...item,

                  theme:
                    normalizeTheme(
                      draft.theme
                    ),

                  updatedAt:
                    now
                }
              : item
        );


    setDraft({
      ...draft,
      savedThemes
    });


    saveSettings({
      ...getSettings(),

      theme:
        normalizeTheme(
          draft.theme
        ),

      savedThemes,

      activeThemeId:
        draft.activeThemeId
    });


    showThemeNotice(
      language === "ja" ? "保存済みテーマを更新しました。" : language === "en"
        ? "Saved theme updated."
        : "Tema salvo atualizado."
    );
  }


  function deleteCustomTheme(
    id
  ) {
    const savedThemes =
      normalizeSavedThemes(
        draft.savedThemes
      )
        .filter(
          (item) =>
            item.id !==
            id
        );


    const activeThemeId =
      draft.activeThemeId ===
      id
        ? null
        : draft.activeThemeId;


    setDraft({
      ...draft,
      savedThemes,
      activeThemeId
    });


    saveSettings({
      ...getSettings(),
      savedThemes,
      activeThemeId
    });


    showThemeNotice(
      language === "ja" ? "テーマを削除しました。" : language === "en"
        ? "Theme deleted."
        : "Tema excluído."
    );
  }


  const activeCustomTheme =
    normalizeSavedThemes(
      draft.savedThemes
    )
      .find(
        (item) =>
          item.id ===
          draft.activeThemeId
      );


  const pt = language !== "en";

  const sections = [
    { id: "general", icon: "⌂", label: language === "ja" ? "一般" : pt ? "Geral" : "General", hint: language === "ja" ? "言語とシステム" : pt ? "Idioma e sistema" : "Language and system" },
    { id: "display", icon: "▣", label: language === "ja" ? "画面" : pt ? "Exibição" : "Display", hint: language === "ja" ? "背景と外観" : pt ? "Fundo e aparência" : "Background and appearance" },
    { id: "audio", icon: "◖", label: language === "ja" ? "音声" : pt ? "Áudio" : "Audio", hint: language === "ja" ? "音量と効果音" : pt ? "Sons do simulador" : "Simulator sounds" },
    { id: "interface", icon: "◇", label: language === "ja" ? "表示" : pt ? "Interface" : "Interface", hint: language === "ja" ? "表示に関する設定" : pt ? "Preferências visuais" : "Visual preferences" },
    { id: "themes", icon: "✦", label: language === "ja" ? "テーマ" : pt ? "Temas" : "Themes", hint: language === "ja" ? "色と外観" : pt ? "Cores e aparência" : "Colors and appearance" },
  ];

  return (
    <main className="settings-game-page eternal-page eternal-settings-page">
      <EternalCinematicBackdrop compact />
      <div className="settings-game-bg" />

      <section className="settings-game-window" role="dialog" aria-label={t("settingsTitle")}>
      <header className="settings-game-topbar">
        <button className="ghost settings-game-back eternal-menu-action" onClick={onBack}>
          {t("back")}
        </button>

        <div className="settings-game-heading">
          <span className="eyebrow">{___bsJa("SYSTEM", "システム")}</span>
          <h1>{t("settingsTitle")}</h1>
          <p>{pt ? ___bsJa("Personalize o simulador do seu jeito.", "シミュレーターを自分好みにカスタマイズします。") : ___bsJa("Customize the simulator your way.", "シミュレーターを自分好みにカスタマイズします。")}</p>
        </div>

        <div className="settings-game-version">
          <small>{pt ? ___bsJa("VERSÃO", "バージョン") : ___bsJa("VERSION", "バージョン")}</small>
          <strong>{APP_VERSION_LABEL}</strong>
        </div>
      </header>

      <div className="settings-game-shell">
        <aside className="settings-game-nav">
          <div className="settings-game-nav-title">
            <span>{pt ? ___bsJa("CONFIGURAÇÕES", "設定") : ___bsJa("SETTINGS", "設定")}</span>
            <small>{pt ? ___bsJa("Selecione uma categoria", "カテゴリを選択してください") : ___bsJa("Choose a category", "カテゴリを選択してください")}</small>
          </div>

          <nav>
            {sections.map((section) => (
              <button
                key={section.id}
                className={activeTab === section.id ? "active" : ""}
                onClick={() => setActiveTab(section.id)}
              >
                <span className="settings-game-nav-icon">{section.icon}</span>
                <span className="settings-game-nav-copy">
                  <b>{section.label}</b>
                  <small>{section.hint}</small>
                </span>
                <i>›</i>
              </button>
            ))}
          </nav>

          <div className="settings-game-nav-footer">
            <span className="settings-game-status-dot" />
            <div>
              <strong>{___bsJa("Eternal Simulator", "エターナルシミュレーター")}</strong>
              <small>{APP_VERSION_LABEL}</small>
            </div>
          </div>
        </aside>

        <section className="settings-game-content">
          {activeTab === "general" && (
            <div className="settings-game-panel">
              <div className="settings-game-panel-heading">
                <div>
                  <span className="eyebrow">{___bsJa("GENERAL", "一般")}</span>
                  <h2>{pt ? ___bsJa("Configurações gerais", "一般設定") : ___bsJa("General settings", "一般設定")}</h2>
                  <p>{pt ? ___bsJa("Idioma, preferências básicas e integração do sistema.", "言語、基本設定、システム統合。") : ___bsJa("Language, basic preferences and system integration.", "言語、基本設定、システム統合。")}</p>
                </div>
              </div>

              <div className="settings-game-grid two">
                <label className="settings-game-field">
                  <span>{t("language")}</span>
                  <small>{pt ? ___bsJa("Idioma usado nos menus e textos do simulador.", "メニューとシミュレータのテキストで使用される言語。") : ___bsJa("Language used in menus and simulator text.", "メニューとシミュレータのテキストで使用される言語。")}</small>
                  <select
                    value={draft.language}
                    onChange={(e) => setDraft({ ...draft, language: e.target.value })}
                  >
                    <option value="ja">{t("japanese")}</option>
                    <option value="ptBR">{t("portuguese")}</option>
                    <option value="en">{t("english")}</option>
                  </select>
                </label>

                <div className="settings-game-info-card">
                  <span>{pt ? ___bsJa("PLATAFORMA", "プラットフォーム") : ___bsJa("PLATFORM", "プラットフォーム")}</span>
                  <strong>{___bsJa("Web", "ウェブ")}</strong>
                  <small>{pt ? ___bsJa("Versão oficial para navegador.", "公式ブラウザ版。") : ___bsJa("Official browser version.", "公式ブラウザ版。")}</small>
                </div>
              </div>

              {adminAllowed && (
                <div className="settings-game-tip admin-entry-card">
                  <span>◆</span>
                  <div>
                    <strong>{___bsJa("Admin Panel", "管理者パネル")}</strong>
                    <small>{pt ? ___bsJa("Gerencie economia e estados de gameplay das contas autorizadas.", "承認されたアカウントの経済とゲームプレイの状態を管理します。") : ___bsJa("Manage economy and gameplay states for authorized accounts.", "承認されたアカウントの経済とゲームプレイの状態を管理します。")}</small>
                  </div>
                  <button type="button" onClick={onAdmin}>{pt ? ___bsJa("Abrir painel", "オープンパネル") : ___bsJa("Open panel", "オープンパネル")}</button>
                </div>
              )}

            </div>
          )}

          {activeTab === "display" && (
            <div className="settings-game-panel">
              <div className="settings-game-panel-heading">
                <div>
                  <span className="eyebrow">{___bsJa("DISPLAY", "画面")}</span>
                  <h2>{pt ? ___bsJa("Exibição e gráficos", "ディスプレイとグラフィックス") : ___bsJa("Display and graphics", "ディスプレイとグラフィックス")}</h2>
                  <p>{pt ? ___bsJa("Ajuste como o simulador aparece no seu monitor.", "シミュレーターがディスプレイにどのように表示されるかを調整します。") : ___bsJa("Adjust how the simulator appears on your display.", "シミュレーターがディスプレイにどのように表示されるかを調整します。")}</p>
                </div>
              </div>

              <div className="settings-game-grid two settings-background-controls">
                <label className="settings-game-field">
                  <span>{pt ? ___bsJa("Fundo do menu", "メニューの背景") : ___bsJa("Menu background", "メニューの背景")}</span>
                  <small>{pt ? ___bsJa("Alterne entre wallpapers estáticos e vídeos em loop.", "静止壁紙とループビデオを切り替えます。") : ___bsJa("Switch between static wallpapers and looping videos.", "静止壁紙とループビデオを切り替えます。")}</small>
                  <select
                    value={draft.backgroundMode || "static"}
                    onChange={(e) => setDraft({ ...draft, backgroundMode: e.target.value })}
                  >
                    <option value="static">{pt ? ___bsJa("Wallpapers estáticos", "静的な壁紙") : ___bsJa("Static wallpapers", "静的な壁紙")}</option>
                    <option value="video">{pt ? ___bsJa("Vídeo em loop", "ビデオをループする") : ___bsJa("Looping video", "ビデオをループする")}</option>
                  </select>
                </label>

                <label className={`settings-game-field ${draft.backgroundMode !== "video" ? "is-disabled" : ""}`}>
                  <span>{pt ? ___bsJa("Vídeo de fundo", "背景ビデオ") : ___bsJa("Background video", "背景ビデオ")}</span>
                  <small>{pt ? ___bsJa("Selecione o vídeo que será usado no fundo.", "背景として使用するビデオを選択します。") : ___bsJa("Choose the video used as the background.", "背景として使用するビデオを選択します。")}</small>
                  <select
                    value={draft.backgroundVideo || "background_video_01.mp4"}
                    disabled={draft.backgroundMode !== "video"}
                    onChange={(e) => setDraft({ ...draft, backgroundVideo: e.target.value })}
                  >
                    {Array.from({ length: 12 }, (_, index) => {
                      const value = `background_video_${String(index + 1).padStart(2, "0")}.mp4`;
                      return <option key={value} value={value}>{pt ? (___bsJapanese() ? `ビデオ ${index + 1}` : `Vídeo ${index + 1}`) : (___bsJapanese() ? `ビデオ ${index + 1}` : `Video ${index + 1}`)}</option>;
                    })}
                  </select>
                </label>
              </div>

              <div className="settings-game-tip">
                <span>i</span>
                <div>
                  <strong>{pt ? ___bsJa("Dica de desempenho", "パフォーマンスのヒント") : ___bsJa("Performance tip", "パフォーマンスのヒント")}</strong>
                  <small>{pt ? ___bsJa("O simulador agora é focado integralmente na Web. Use o zoom padrão do navegador e prefira tela cheia do próprio navegador quando quiser mais espaço.", "シミュレーターは現在、Web に完全に焦点を当てています。もっとスペースが必要な場合は、ブラウザのデフォルトのズームと独自の全画面モードを使用してください。") : ___bsJa("The simulator is now fully focused on the Web. Use the browser default zoom and its own fullscreen mode when you want more space.", "シミュレーターは現在、Web に完全に焦点を当てています。もっとスペースが必要な場合は、ブラウザのデフォルトのズームと独自の全画面モードを使用してください。")}</small>
                </div>
              </div>
            </div>
          )}

          {activeTab === "audio" && (
            <div className="settings-game-panel">
              <div className="settings-game-panel-heading">
                <div>
                  <span className="eyebrow">{___bsJa("AUDIO", "オーディオ")}</span>
                  <h2>{pt ? ___bsJa("Áudio", "オーディオ") : ___bsJa("Audio", "オーディオ")}</h2>
                  <p>{pt ? ___bsJa("Os controles de áudio serão disponibilizados em uma atualização futura.", "オーディオ コントロールは将来のアップデートで利用可能になる予定です。") : ___bsJa("Audio controls will be available in a future update.", "オーディオ コントロールは将来のアップデートで利用可能になる予定です。")}</p>
                </div>
                <span className="settings-coming-badge">{pt ? ___bsJa("EM PREPARAÇÃO", "近日公開") : ___bsJa("COMING SOON", "近日公開")}</span>
              </div>

              <div className="settings-game-audio-list">
                <div className="settings-audio-row disabled">
                  <span className="settings-audio-icon">◖</span>
                  <div>
                    <strong>{pt ? ___bsJa("Volume geral", "マスターボリューム") : ___bsJa("Master volume", "マスターボリューム")}</strong>
                    <small>{pt ? ___bsJa("Controlará todos os sons do simulador.", "すべてのシミュレーターサウンドをコントロールします。") : ___bsJa("Will control all simulator sounds.", "すべてのシミュレーターサウンドをコントロールします。")}</small>
                  </div>
                  <input type="range" min="0" max="100" value="80" readOnly disabled />
                  <b>80%</b>
                </div>

                <div className="settings-audio-row disabled">
                  <span className="settings-audio-icon">✦</span>
                  <div>
                    <strong>{pt ? ___bsJa("Efeitos da partida", "試合効果") : ___bsJa("Match effects", "試合効果")}</strong>
                    <small>{pt ? ___bsJa("Ataques, Cores, cartas, fases e notificações.", "攻撃、コア、カード、フェイズ、通知。") : ___bsJa("Attacks, Cores, cards, phases and notifications.", "攻撃、コア、カード、フェイズ、通知。")}</small>
                  </div>
                  <input type="range" min="0" max="100" value="85" readOnly disabled />
                  <b>85%</b>
                </div>

                <div className="settings-audio-row disabled">
                  <span className="settings-audio-icon">⌁</span>
                  <div>
                    <strong>{pt ? ___bsJa("Sons da interface", "インターフェイスサウンド") : ___bsJa("Interface sounds", "インターフェイスサウンド")}</strong>
                    <small>{pt ? ___bsJa("Botões, menus e confirmações.", "ボタン、メニュー、確認。") : ___bsJa("Buttons, menus and confirmations.", "ボタン、メニュー、確認。")}</small>
                  </div>
                  <input type="range" min="0" max="100" value="65" readOnly disabled />
                  <b>65%</b>
                </div>
              </div>

              <div className="settings-game-tip muted-tip">
                <span>!</span>
                <div>
                  <strong>{pt ? ___bsJa("Áudio em breve", "オーディオは近日公開予定") : ___bsJa("Audio coming soon", "オーディオは近日公開予定")}</strong>
                  <small>{pt ? ___bsJa("As opções de áudio serão habilitadas em uma atualização futura.", "音声オプションは将来のアップデートで有効になる予定です。") : ___bsJa("Audio options will be enabled in a future update.", "音声オプションは将来のアップデートで有効になる予定です。")}</small>
                </div>
              </div>
            </div>
          )}

          {activeTab === "interface" && (
            <div className="settings-game-panel">
              <div className="settings-game-panel-heading">
                <div>
                  <span className="eyebrow">{___bsJa("INTERFACE", "インタフェース")}</span>
                  <h2>{pt ? ___bsJa("Interface e jogador", "インターフェイスとプレーヤー") : ___bsJa("Interface and player", "インターフェイスとプレーヤー")}</h2>
                  <p>{pt ? ___bsJa("Preferências visuais usadas dentro das partidas.", "試合中に使用されるビジュアル設定。") : ___bsJa("Visual preferences used during matches.", "試合中に使用されるビジュアル設定。")}</p>
                </div>
              </div>

              <div className="settings-game-grid two">
                <label className="settings-game-field">
                  <span>{pt ? ___bsJa("Cor preferida do jogador", "プレイヤーの好みの色") : ___bsJa("Preferred player color", "プレイヤーの好みの色")}</span>
                  <small>{pt ? ___bsJa("Usada como referência visual nas telas compatíveis.", "互換性のある画面の視覚的な参照として使用されます。") : ___bsJa("Used as a visual reference on compatible screens.", "互換性のある画面の視覚的な参照として使用されます。")}</small>
                  <div className="settings-color-row">
                    <input
                      type="color"
                      value={draft.preferredPlayerColor || "#d8d8d8"}
                      onChange={(e) => setDraft({ ...draft, preferredPlayerColor: e.target.value })}
                    />
                    <code>{draft.preferredPlayerColor || "#d8d8d8"}</code>
                  </div>
                </label>

                <div className="settings-game-info-card">
                  <span>{pt ? ___bsJa("ESTILO ATIVO", "アクティブなスタイル") : ___bsJa("ACTIVE STYLE", "アクティブなスタイル")}</span>
                  <strong>{activeCustomTheme?.name || RECOMMENDED_THEMES.find((preset) => `recommended:${preset.id}` === draft.activeThemeId)?.name?.[language] || ___bsJa("Eternal", "エターナル")}</strong>
                  <ThemeSwatches theme={draft.theme} />
                </div>
              </div>

              <div className="settings-game-tip">
                <span>◇</span>
                <div>
                  <strong>{pt ? ___bsJa("Mais opções virão aqui", "より多くのオプションがここに存在します") : ___bsJa("More options will live here", "より多くのオプションがここに存在します")}</strong>
                  <small>{pt ? ___bsJa("Escala da interface, animações, zoom das cartas e outros ajustes podem ser adicionados nesta categoria sem misturar com gráficos ou temas.", "UI スケール、アニメーション、カード ズーム、その他の調整を、表示やテーマと混ぜることなくここに追加できます。") : ___bsJa("UI scale, animations, card zoom and other adjustments can be added here without mixing them with display or themes.", "UI スケール、アニメーション、カード ズーム、その他の調整を、表示やテーマと混ぜることなくここに追加できます。")}</small>
                </div>
              </div>
            </div>
          )}

          {activeTab === "themes" && (
            <div className="settings-game-panel themes-panel">
              <div className="theme-library settings-theme-library">
                <div className="settings-section-heading settings-game-panel-heading">
                  <div>
                    <span className="eyebrow">{___bsJa("THEME", "テーマ")}</span>
                    <h2>{pt ? ___bsJa("Temas do simulador", "シミュレーターのテーマ") : ___bsJa("Simulator themes", "シミュレーターのテーマ")}</h2>
                    <p className="theme-library-subtitle">{pt ? ___bsJa("Use um tema recomendado ou crie e salve o seu próprio.", "推奨されたテーマを使用するか、独自のテーマを作成して保存します。") : ___bsJa("Use a recommended theme or create and save your own.", "推奨されたテーマを使用するか、独自のテーマを作成して保存します。")}</p>
                  </div>
                  <button className="ghost" onClick={resetTheme}>{pt ? ___bsJa("Restaurar", "リセット") : ___bsJa("Reset", "リセット")}</button>
                </div>

                <section className="theme-library-section">
                  <div className="theme-library-section-heading">
                    <div>
                      <span>{pt ? ___bsJa("Recomendados", "推奨") : ___bsJa("Recommended", "推奨")}</span>
                      <strong>{pt ? ___bsJa("Temas prontos para usar", "すぐに使えるテーマ") : ___bsJa("Ready-to-use themes", "すぐに使えるテーマ")}</strong>
                    </div>
                  </div>

                  <div className="recommended-theme-grid">
                    {RECOMMENDED_THEMES.map((preset) => {
                      const active = draft.activeThemeId === `recommended:${preset.id}`;
                      return (
                        <article className={`theme-preset-card ${active ? "active" : ""}`} key={preset.id}>
                          <div
                            className="theme-preset-preview"
                            style={{
                              "--theme-card-bg": preset.theme.bg,
                              "--theme-card-panel": preset.theme.panel,
                              "--theme-card-accent": preset.theme.accent,
                              "--theme-card-accent-2": preset.theme.accent2
                            }}
                          >
                            <div className="theme-preview-window">
                              <div className="theme-preview-topbar"><i /><i /><i /></div>
                              <div className="theme-preview-content"><span /><span /><b /></div>
                            </div>
                          </div>

                          <div className="theme-preset-copy">
                            <div className="theme-preset-title">
                              <strong>{preset.name[language] || preset.name.ptBR}</strong>
                              {active && <span className="theme-active-badge">✓ {pt ? ___bsJa("Ativo", "アクティブ") : ___bsJa("Active", "アクティブ")}</span>}
                            </div>
                            <p>{preset.description[language] || preset.description.ptBR}</p>
                            <ThemeSwatches theme={preset.theme} />
                            <button className={active ? "ghost" : "theme-apply-button"} onClick={() => applyRecommendedTheme(preset)}>
                              {active ? (pt ? ___bsJa("Aplicado", "適用済み") : ___bsJa("Applied", "適用済み")) : (pt ? ___bsJa("Aplicar tema", "テーマを適用する") : ___bsJa("Apply theme", "テーマを適用する"))}
                            </button>
                          </div>
                        </article>
                      );
                    })}
                  </div>
                </section>

                <section className="theme-library-section theme-customizer">
                  <div className="theme-library-section-heading">
                    <div>
                      <span>{pt ? ___bsJa("Criar", "作成する") : ___bsJa("Create", "作成する")}</span>
                      <strong>{pt ? ___bsJa("Monte seu próprio tema", "独自のテーマを構築する") : ___bsJa("Build your own theme", "独自のテーマを構築する")}</strong>
                    </div>
                    {activeCustomTheme && (
                      <button className="ghost" onClick={updateActiveCustomTheme}>{pt ? ___bsJa("Atualizar tema ativo", "アクティブなテーマを更新する") : ___bsJa("Update active theme", "アクティブなテーマを更新する")}</button>
                    )}
                  </div>

                  <div className="theme-color-grid">
                    {THEME_FIELDS.map(([key, labelPT, labelEN]) => (
                      <label key={key}>
                        {language === "ja" ? ({ bg: "背景", panel: "パネル", panel2: "補助パネル", text: "文字", muted: "補助文字", accent: "アクセント", accent2: "アクセント2", danger: "警告", ok: "成功" }[key]) : pt ? labelPT : labelEN}
                        <div className="color-input-row">
                          <input type="color" value={normalizeTheme(draft.theme)[key]} onChange={(e) => setTheme(key, e.target.value)} />
                          <code>{normalizeTheme(draft.theme)[key]}</code>
                        </div>
                      </label>
                    ))}
                  </div>

                  <div className="save-theme-row">
                    <label>
                      {pt ? ___bsJa("Nome do tema", "テーマ名") : ___bsJa("Theme name", "テーマ名")}
                      <input
                        value={themeName}
                        maxLength={32}
                        onChange={(e) => setThemeName(e.target.value)}
                        placeholder={pt ? ___bsJa("Meu tema Battle Spirits", "私のバトルスピリッツのテーマ") : ___bsJa("My Battle Spirits theme", "私のバトルスピリッツのテーマ")}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            saveCurrentTheme();
                          }
                        }}
                      />
                    </label>
                    <button className="primary-btn" onClick={saveCurrentTheme}>{pt ? ___bsJa("Salvar tema", "テーマの保存") : ___bsJa("Save theme", "テーマの保存")}</button>
                  </div>
                </section>

                <section className="theme-library-section">
                  <div className="theme-library-section-heading">
                    <div>
                      <span>{pt ? ___bsJa("Biblioteca", "一覧") : ___bsJa("Library", "一覧")}</span>
                      <strong>{pt ? ___bsJa("Meus temas", "私のテーマ") : ___bsJa("My themes", "私のテーマ")}</strong>
                    </div>
                    <small>{normalizeSavedThemes(draft.savedThemes).length}{language === "ja" ? "件保存" : pt ? " salvos" : " saved"}</small>
                  </div>

                  {normalizeSavedThemes(draft.savedThemes).length === 0 ? (
                    <div className="theme-library-empty">
                      <strong>{pt ? ___bsJa("Nenhum tema personalizado ainda", "カスタムテーマはまだありません") : ___bsJa("No custom themes yet", "カスタムテーマはまだありません")}</strong>
                      <span>{pt ? ___bsJa("Ajuste as cores acima e salve seu primeiro tema.", "上記の色を調整し、最初のテーマを保存します。") : ___bsJa("Adjust the colors above and save your first theme.", "上記の色を調整し、最初のテーマを保存します。")}</span>
                    </div>
                  ) : (
                    <div className="saved-theme-list">
                      {normalizeSavedThemes(draft.savedThemes).map((item) => {
                        const active = draft.activeThemeId === item.id;
                        return (
                          <article className={`saved-theme-card ${active ? "active" : ""}`} key={item.id}>
                            <div className="saved-theme-info">
                              <div className="saved-theme-title">
                                <strong>{item.name}</strong>
                                {active && <span className="theme-active-badge">✓ {pt ? ___bsJa("Ativo", "アクティブ") : ___bsJa("Active", "アクティブ")}</span>}
                              </div>
                              <ThemeSwatches theme={item.theme} />
                            </div>
                            <div className="saved-theme-actions">
                              <button className={active ? "ghost" : ""} onClick={() => applyCustomTheme(item)}>{active ? (pt ? ___bsJa("Aplicado", "適用済み") : ___bsJa("Applied", "適用済み")) : (pt ? ___bsJa("Aplicar", "適用する") : ___bsJa("Apply", "適用する"))}</button>
                              <button className="ghost danger" onClick={() => deleteCustomTheme(item.id)}>{pt ? ___bsJa("Excluir", "消去") : ___bsJa("Delete", "消去")}</button>
                            </div>
                          </article>
                        );
                      })}
                    </div>
                  )}

                  {themeNotice && <div className="theme-library-notice">{themeNotice}</div>}
                </section>
              </div>
            </div>
          )}

                    <footer className="settings-game-actions">
            <div>
              {saved && <span className="success-text">✓ {t("settingsSaved")}</span>}
            </div>
            <button className="primary-btn big eternal-menu-action active" onClick={apply}>{t("apply")}</button>
          </footer>
        </section>
      </div>
      </section>
    </main>
  );
}
