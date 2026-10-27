import { createContext, useContext, useMemo, useState } from "react";
import { getSettings, saveSettings } from "../services/platform/storage.js";

const translations = {
  ja: {
    back: "← 戻る", local: "ローカル対戦", online: "オンライン対戦", decks: "デッキ", profile: "プロフィール", account: "アカウント", settings: "設定",
    gateOpen: "ゲートオープン！", fanSimulator: "非公式シミュレーター", cardsLoaded: "枚", savedDecks: "デッキ", rulesTarget: "ルール",
    deckLibrary: "マイデッキ", newDeck: "新しいデッキ", editDeck: "デッキを編集", createDeck: "デッキを作成", deleteDeck: "デッキを削除", deckCover: "表紙カード",
    save: "保存", name: "名前", playerName: "プレイヤー名", avatar: "プロフィール画像", saveProfile: "プロフィールを保存", removePhoto: "画像を削除", profileSaved: "プロフィールを保存しました。",
    local1v1: "ローカル対戦", prepareBattle: "対戦準備", player1: "プレイヤー1", player2: "プレイヤー2", deck: "デッキ", firstPlayer: "先攻", random: "ランダム", startMatch: "対戦を始める",
    online1v1: "オンライン対戦", roomByCode: "ルームコードで参加", server: "サーバー", connected: "接続中", disconnected: "未接続", createRoom: "ルームを作成", join: "参加", roomCode: "ルームコード", waiting: "待機中...",
    selectedCard: "選択中のカード", selectCardHint: "カードを選ぶと詳細を確認できます。", matchControl: "対戦操作", advancePhase: "次のステップへ", log: "履歴", chat: "チャット", exit: "終了",
    reserve: "リザーブ", coreTrash: "コアトラッシュ", dragCores: "コアを移動", pendingPlay: "使用中のカード", confirmPlay: "確定", cancelPlay: "取り消す",
    cost: "コスト", summonCost: "召喚コスト", paid: "支払い済み", minLevel: "必要なコア", costReduction: "軽減", printedCost: "基本コスト", finalCost: "支払うコスト", current: "現在", manualPaymentHint: "リザーブのコアを選び、コストと召喚に必要なコアを支払ってください。",
    settingsTitle: "設定", language: "言語", resolution: "解像度", displayMode: "表示モード", fullscreen: "全画面", windowed: "ウィンドウ", apply: "適用",
    portuguese: "Português (Brasil)", english: "English", japanese: "日本語", effect: "効果", abilities: "能力", families: "系統", noEffect: "効果テキストはありません。",
    deckBuilder: "デッキ構築", eternalFormat: "エターナル", currentList: "現在のデッキ", myDecks: "マイデッキ", cards: "枚", validDeck: "使用可能", allTypes: "すべての種類", allColors: "すべての色", searchCards: "名前、カード番号、系統で検索",
    noDecks: "デッキがありません", noDecksOnline: "オンライン対戦には使用可能なデッキが必要です。",
    manualResolution: "手動処理", battleSequence: "エターナルの進行", battleSequenceText: "スタート → コア → ドロー → リフレッシュ → メイン → アタック → エンド",
    turn: "ターン", priority: "自分の優先権", waitingPlayer: "待機中", phase: "現在のステップ", battle: "バトル", passFlash: "フラッシュをパス", noBlock: "ブロックしない", resolveBattle: "バトルを解決",
    summon: "召喚", deployNexus: "ネクサスを配置", useMain: "メイン効果を使用", useFlash: "フラッシュ効果を使用", declareAttack: "アタック", block: "このカードでブロック",
    chatPlaceholder: "メッセージを入力", send: "送信", noMessages: "メッセージはありません。",
    settingsSaved: "設定を保存しました。", updates: "更新", updateServer: "自動更新", updateServerHint: "利用可否はインストールされたバージョンにより異なります。", updateDescription: "新しいバージョンを確認します。", checkUpdates: "更新を確認", playerDataStored: "プレイヤーデータ", mainMenu: "メインメニュー", opponent: "相手", player: "プレイヤー", currentTurn: "現在のターン", matchEnd: "対戦終了", wins: "の勝利", noCardsFound: "カードがありません"
  },
  ptBR: {
    back: "← Voltar", local: "Partida local", online: "Jogar online", decks: "Decks", profile: "Perfil", account: "Conta", settings: "Configurações",
    gateOpen: "Gate Open, Kaihou!", fanSimulator: "SIMULADOR NÃO OFICIAL", cardsLoaded: "cartas", savedDecks: "decks", rulesTarget: "regras",
    deckLibrary: "Meus Decks", newDeck: "Novo Deck", editDeck: "Editar deck", createDeck: "Criar deck", deleteDeck: "Excluir deck", deckCover: "Carta de capa",
    save: "Salvar", name: "Nome", playerName: "Nome do jogador", avatar: "Foto de perfil", saveProfile: "Salvar perfil", removePhoto: "Remover foto", profileSaved: "Perfil salvo.",
    local1v1: "LOCAL 1V1", prepareBattle: "Preparar batalha", player1: "Jogador 1", player2: "Jogador 2", deck: "Deck", firstPlayer: "Primeiro jogador", random: "Aleatório", startMatch: "Iniciar partida",
    online1v1: "ONLINE 1V1", roomByCode: "Sala por código", server: "Servidor", connected: "conectado", disconnected: "desconectado", createRoom: "Criar sala", join: "Entrar", roomCode: "CÓDIGO DA SALA", waiting: "Aguardando...",
    selectedCard: "CARTA SELECIONADA", selectCardHint: "Clique em uma carta visível para inspecioná-la.", matchControl: "CONTROLE DA PARTIDA", advancePhase: "Avançar fase", log: "Log", chat: "Chat", exit: "Sair",
    reserve: "RESERVE", coreTrash: "CORE TRASH", dragCores: "Arraste os Cores", pendingPlay: "JOGADA PENDENTE", confirmPlay: "Confirmar jogada", cancelPlay: "Cancelar jogada",
    cost: "Custo", summonCost: "Custo de invocação", paid: "Pago", minLevel: "Cores mínimo", costReduction: "Redução", printedCost: "Custo base", finalCost: "Custo final", current: "Atual", manualPaymentHint: "Clique ou arraste Cores da Reserve para pagar o custo e colocar os Cores de Lv antes de confirmar.",
    settingsTitle: "Configurações do simulador", language: "Idioma", resolution: "Resolução", displayMode: "Modo de exibição", fullscreen: "Tela cheia", windowed: "Janela", apply: "Aplicar",
    portuguese: "Português (Brasil)", english: "English", japanese: "日本語", effect: "Efeito", abilities: "Habilidades", families: "Famílias", noEffect: "Nenhum texto de efeito disponível.",
    deckBuilder: "DECK BUILDER", eternalFormat: "Formato Eternal", currentList: "Lista atual", myDecks: "Meus decks", cards: "cartas", validDeck: "Deck válido", allTypes: "Todos os tipos", allColors: "Todas as cores", searchCards: "Buscar nome, número ou família...",
    noDecks: "Você ainda não tem decks", noDecksOnline: "Crie um deck válido antes de entrar no online.",
    manualResolution: "Resolução manual", battleSequence: "Sequência Eternal", battleSequenceText: "Start → Core → Draw → Refresh → Main → Attack → End",
    turn: "Turno", priority: "Sua prioridade", waitingPlayer: "Aguardando", phase: "Fase atual", battle: "BATALHA", passFlash: "Passar Flash", noBlock: "Não bloquear", resolveBattle: "Resolver batalha",
    summon: "Invocar", deployNexus: "Colocar Nexus", useMain: "Usar Main", useFlash: "Usar Flash", declareAttack: "Declarar ataque", block: "Bloquear com esta carta",
    chatPlaceholder: "Digite uma mensagem...", send: "Enviar", noMessages: "Nenhuma mensagem ainda.",
    settingsSaved: "Configurações aplicadas.", updates: "Atualizações", updateServer: "Atualizações automáticas", updateServerHint: "Disponibilidade depende da versão instalada.", updateDescription: "Confira se há uma nova versão do Eternal Simulator.", checkUpdates: "Verificar atualizações", playerDataStored: "Dados do jogador", mainMenu: "Menu principal", opponent: "Oponente", player: "Jogador", currentTurn: "turno atual", matchEnd: "Fim da partida", wins: "venceu!", noCardsFound: "Nenhuma carta"
  },
  en: {
    back: "← Back", local: "Local match", online: "Play online", decks: "Decks", profile: "Profile", account: "Account", settings: "Settings",
    gateOpen: "Gate Open, Kaihou!", fanSimulator: "UNOFFICIAL FAN SIMULATOR", cardsLoaded: "cards", savedDecks: "decks", rulesTarget: "rules",
    deckLibrary: "My Decks", newDeck: "New Deck", editDeck: "Edit deck", createDeck: "Create deck", deleteDeck: "Delete deck", deckCover: "Cover card",
    save: "Save", name: "Name", playerName: "Player name", avatar: "Profile picture", saveProfile: "Save profile", removePhoto: "Remove picture", profileSaved: "Profile saved.",
    local1v1: "LOCAL 1V1", prepareBattle: "Prepare battle", player1: "Player 1", player2: "Player 2", deck: "Deck", firstPlayer: "First player", random: "Random", startMatch: "Start match",
    online1v1: "ONLINE 1V1", roomByCode: "Room by code", server: "Server", connected: "connected", disconnected: "disconnected", createRoom: "Create room", join: "Join", roomCode: "ROOM CODE", waiting: "Waiting...",
    selectedCard: "SELECTED CARD", selectCardHint: "Click a visible card to inspect it.", matchControl: "MATCH CONTROL", advancePhase: "Advance phase", log: "Log", chat: "Chat", exit: "Exit",
    reserve: "RESERVE", coreTrash: "CORE TRASH", dragCores: "Drag Cores", pendingPlay: "PENDING PLAY", confirmPlay: "Confirm play", cancelPlay: "Cancel play",
    cost: "Cost", summonCost: "Summon cost", paid: "Paid", minLevel: "Minimum Cores", costReduction: "Reduction", printedCost: "Base cost", finalCost: "Final cost", current: "Current", manualPaymentHint: "Click or drag Reserve Cores to pay the cost and place the required Lv Cores before confirming.",
    settingsTitle: "Simulator settings", language: "Language", resolution: "Resolution", displayMode: "Display mode", fullscreen: "Fullscreen", windowed: "Windowed", apply: "Apply",
    portuguese: "Português (Brasil)", english: "English", japanese: "日本語", effect: "Effect", abilities: "Abilities", families: "Families", noEffect: "No effect text available.",
    deckBuilder: "DECK BUILDER", eternalFormat: "Eternal Format", currentList: "Current list", myDecks: "My decks", cards: "cards", validDeck: "Valid deck", allTypes: "All types", allColors: "All colors", searchCards: "Search name, number or family...",
    noDecks: "You do not have any decks yet", noDecksOnline: "Create a valid deck before playing online.",
    manualResolution: "Manual resolution", battleSequence: "Eternal sequence", battleSequenceText: "Start → Core → Draw → Refresh → Main → Attack → End",
    turn: "Turn", priority: "Your priority", waitingPlayer: "Waiting for", phase: "Current phase", battle: "BATTLE", passFlash: "Pass Flash", noBlock: "Do not block", resolveBattle: "Resolve battle",
    summon: "Summon", deployNexus: "Deploy Nexus", useMain: "Use Main", useFlash: "Use Flash", declareAttack: "Declare attack", block: "Block with this card",
    chatPlaceholder: "Type a message...", send: "Send", noMessages: "No messages yet.",
    settingsSaved: "Settings applied.", updates: "Updates", updateServer: "Automatic updates", updateServerHint: "Availability depends on the installed version.", updateDescription: "Check whether a new Eternal Simulator version is available.", checkUpdates: "Check for updates", playerDataStored: "Player data", mainMenu: "Main menu", opponent: "Opponent", player: "Player", currentTurn: "current turn", matchEnd: "Match over", wins: "wins!", noCardsFound: "No cards found"
  }
};

const LanguageContext = createContext({ language: "ja", t: (key) => key, setLanguage: () => {} });

export function LanguageProvider({ children }) {
  const initial = getSettings().language || "ja";
  const [language, setLanguageState] = useState(initial);
  const value = useMemo(() => ({
    language,
    t: (key) => translations[language]?.[key] ?? translations.ptBR[key] ?? key,
    setLanguage(next) {
      const safe = ["ja", "en", "ptBR"].includes(next) ? next : "ja";
      saveSettings({ ...getSettings(), language: safe });
      setLanguageState(safe);
    }
  }), [language]);
  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() { return useContext(LanguageContext); }
