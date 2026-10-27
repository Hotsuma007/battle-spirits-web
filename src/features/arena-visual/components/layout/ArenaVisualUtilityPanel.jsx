import { japaneseText as ___bsJa, isJapaneseDisplay as ___bsJapanese } from "../../../../localization/displayLanguage.js";
import { japaneseGameLog, japanesePhase } from "../../../../localization/gameLog.js";
import { cardIndex } from "../../../../services/cards/cardRepository.js";
import { useEffect, useState } from "react";
import { useLanguage } from "../../../../localization/i18n.jsx";

const TABS = [
  ["inspector", "Card"],
  ["manual", "Manual"],
  ["log", "Log"],
  ["chat", "Chat"]
];

const PHASES = ["Start", "Core", "Draw", "Refresh", "Main", "Attack", "End"];

const CARD_COLOR_STYLES = {
  red: { accent: "#ef5350", soft: "rgba(239,83,80,.16)" },
  purple: { accent: "#ab6ee8", soft: "rgba(171,110,232,.16)" },
  green: { accent: "#5fbd68", soft: "rgba(95,189,104,.16)" },
  white: { accent: "#e9edf2", soft: "rgba(233,237,242,.13)" },
  yellow: { accent: "#e6c84f", soft: "rgba(230,200,79,.16)" },
  blue: { accent: "#4da4e8", soft: "rgba(77,164,232,.16)" }
};

const OFFICIAL_KEYWORDS = [
  "Flash", "Burst", "Brave", "Confront", "Rush", "Immortality", "Awaken",
  "Ultra Awaken", "Curse", "True Curse", "Crush", "High Speed", "Ice Wall",
  "Armor", "Heavy Armor", "Tribute", "Charge", "Assault", "Holy Life", "Storm",
  "Strong Wind", "Windstorm", "Swift", "Accel", "Brilliance", "Clash", "Strengthening",
  "Ultimate Trigger", "Critical Hit", "Chain", "Contract Advent Source", "Soul State",
  "When Summoned", "When Attacks", "When Blocks", "When Braved", "While Set",
  "Once per Turn", "Either Attack Step", "During OC", "Spirit", "Ultimate", "Nexus", "Magic"
];

function normalizeColor(card) {
  const raw = card?.color || card?.colors?.[0] || "";
  const color = String(raw).trim().toLowerCase();
  return CARD_COLOR_STYLES[color] ? color : "white";
}

function escapeRegExp(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function extractBracketKeywords(text) {
  return [...String(text || "").matchAll(/\[([^\]]{1,80})\]/g)]
    .map((match) => match[1]?.trim())
    .filter(Boolean);
}

function createKeywordRegex(card, text = "") {
  const explicit = Array.isArray(card?.keywords)
    ? card.keywords.filter((value) => typeof value === "string" && value.trim())
    : [];
  const candidates = [...new Set([...explicit, ...OFFICIAL_KEYWORDS, ...extractBracketKeywords(text)])]
    .filter(Boolean)
    .sort((a, b) => b.length - a.length);
  if (!candidates.length) return null;
  return new RegExp(`(${candidates.map(escapeRegExp).join("|")})`, "gi");
}

function HighlightedRulesText({ card, text }) {
  if (!text) return null;
  const chunks = String(text).split(/(\[[^\]]+\])/g).filter(Boolean);
  return chunks.flatMap((chunk, chunkIndex) => {
    if (/^\[[^\]]+\]$/.test(chunk)) {
      return <mark className="arena-visual-keyword is-bracketed" key={`bracket-${chunkIndex}`}>{chunk}</mark>;
    }
    const keywordRegex = createKeywordRegex(card, chunk);
    if (!keywordRegex) return chunk;
    return String(chunk).split(keywordRegex).map((part, index) => {
      keywordRegex.lastIndex = 0;
      const isKeyword = keywordRegex.test(part);
      keywordRegex.lastIndex = 0;
      return isKeyword
        ? <mark className="arena-visual-keyword" key={`${chunkIndex}-${part}-${index}`}>{part}</mark>
        : part;
    });
  });
}

function effectBlocks(card) {
  const primaryText = card?.rulesText || card?.effectText || card?.description || "";
  const blocks = String(primaryText)
    .split(/\n{2,}|(?=\[[^\]]+\])/g)
    .map((value) => value.trim())
    .filter(Boolean);
  if (blocks.length) return blocks;
  return (Array.isArray(card?.effects) ? card.effects : [])
    .map((effect) => typeof effect === "string" ? effect : (effect?.text || effect?.effectText || effect?.description || ""))
    .map((value) => String(value).trim())
    .filter(Boolean);
}

function InspectorPanel({ card }) {
  const { language } = useLanguage();
  const ja = language === "ja";
  if (!card) {
    return (
      <div className="arena-visual-utility-empty">
        <span>{ja ? "カード詳細" : ___bsJa("Card Inspector", "カード詳細")}</span>
        <strong>{ja ? "カードを選択" : ___bsJa("Select a card", "カードを選択してください")}</strong>
        <p>{ja ? "手札やフィールドのカードを選ぶと、詳細を確認できます。" : ___bsJa("Click a card in your hand or on either Battlefield to inspect its information and effects.", "手札または戦場のいずれかのカードをクリックして、その情報と効果を確認します。")}</p>
      </div>
    );
  }

  const colorName = normalizeColor(card);
  const colorStyle = CARD_COLOR_STYLES[colorName];
  const effectParagraphs = effectBlocks(card);

  return (
    <div
      className="arena-visual-inspector"
      style={{
        "--arena-visual-card-accent": colorStyle.accent,
        "--arena-visual-card-accent-soft": colorStyle.soft
      }}
    >
      <div className="arena-visual-inspector-artwork">
        <img src={card.image || "/images/card-back.webp"} alt={card.name || ___bsJa("Card", "カード")} draggable="false" />
      </div>

      <div className="arena-visual-inspector-identity">
        <span className="arena-visual-inspector-type">{ja ? ({ spirit: "スピリット", nexus: "ネクサス", magic: "マジック", brave: "ブレイヴ", ultimate: "アルティメット" }[card.cardType || card.type] || "カード") : (card.cardType || card.type || ___bsJa("Card", "カード"))}</span>
        <h2>{card.name || ___bsJa("Card", "カード")}</h2>
        <div className="arena-visual-inspector-tags">
          {card.cardId ? <b>{card.cardId}</b> : null}
          {Number.isFinite(card.cost) ? <b>{ja ? "コスト" : ___bsJa("Cost", "コスト")} {card.cost}</b> : null}
          {Number.isFinite(card.level) ? <b>Lv{card.level}</b> : null}
          {Number.isFinite(card.bp) ? <b>{card.bp} BP</b> : null}
          {card.rarity ? <b>{card.rarity}</b> : null}
        </div>
      </div>

      <div className="arena-visual-inspector-section">
        <span>{ja ? "効果" : ___bsJa("Effects & Keywords", "効果とキーワード")}</span>
        {ja && effectParagraphs.length ? <small>効果文は参考訳です。正確な内容はカード画像をご確認ください。</small> : null}
        {effectParagraphs.length ? effectParagraphs.map((effect, index) => (
          <article className="arena-visual-effect-block" key={`${index}-${effect.slice(0, 24)}`}>
            <b>{ja ? "効果" : ___bsJa("Effect", "効果")} {String(index + 1).padStart(2, "0")}</b>
            <p><HighlightedRulesText card={card} text={effect} /></p>
          </article>
        )) : <p className="is-muted">{ja ? "効果テキストがありません。" : ___bsJa("No card text available.", "カードテキストはありません。")}</p>}
      </div>

      <div className="arena-visual-inspector-stats">
        <div><span>{ja ? "コア" : ___bsJa("Cores", "コア")}</span><strong>{card.coreCount || 0}</strong></div>
        <div><span>{ja ? "ソウルコア" : ___bsJa("Soul Core", "ソウルコア")}</span><strong>{card.soulCoreCount || 0}</strong></div>
        <div><span>{ja ? "状態" : ___bsJa("Status", "状態")}</span><strong>{card.exhausted ? (ja ? "疲労" : ___bsJa("Exhausted", "疲れ果てた")) : (ja ? "回復" : ___bsJa("Ready", "準備ができて"))}</strong></div>
      </div>
    </div>
  );
}

function MatchPanel({ utility }) {
  const currentPhase = utility?.currentPhase || "Main";
  const currentPhaseIndex = Math.max(0, PHASES.findIndex((phase) => phase.toLowerCase() === String(currentPhase).toLowerCase()));
  return (
    <div className="arena-visual-match-panel">
      <div className="arena-visual-turn-card">
        <span>{___bsJa("Turn", "ターン")}</span><strong>{utility?.turnNumber || 1}</strong>
        <small>{utility?.activePlayerName || ___bsJa("Current player", "現在のプレイヤー")}</small>
      </div>
      <div className="arena-visual-phase-track">
        {PHASES.map((phase, index) => (
          <div key={phase} className={`arena-visual-phase-step${index === currentPhaseIndex ? " is-current" : ""}${index < currentPhaseIndex ? " is-complete" : ""}`}>
            <i />
            <span>{___bsJapanese() ? japanesePhase(phase) : phase}</span>
          </div>
        ))}
      </div>
      <div className="arena-visual-match-status">
        <span>{___bsJa("Priority", "優先度")}</span><strong>{utility?.priorityLabel || ___bsJa("Waiting", "待っている")}</strong>
      </div>
      <BattleStatusBanner battle={utility?.battle} />
    </div>
  );
}

function ManualPanel({ selectedCard, utility, onActionRequest }) {
  const manual = utility?.manual || {};
  const disabled = !manual.canUse;
  const selectedInstanceId = selectedCard?.instanceId || manual.selectedInstanceId || null;
  const selectedZone = manual.selectedZone || selectedCard?.sourceZone || null;
  const actorId = manual.actorId || null;
  const revealed = Array.isArray(manual.revealed) ? manual.revealed : [];

  function manualAction(payload) {
    if (disabled) return;
    onActionRequest?.({ id: `manual-${payload.type}`, type: "MANUAL_ACTION", actorId, payload });
  }

  function moveSelected(destination, placement = "top") {
    if (!selectedInstanceId) return;
    if (destination === "trash" && ["spirits", "nexuses", "other"].includes(selectedZone)) {
      manualAction({ type: "destroy", instanceId: selectedInstanceId });
      return;
    }
    if (destination === "hand" && ["spirits", "nexuses", "other"].includes(selectedZone)) {
      manualAction({ type: "returnHand", instanceId: selectedInstanceId });
      return;
    }
    manualAction({ type: "moveCard", instanceId: selectedInstanceId, destination, placement });
  }

  return (
    <div className="arena-visual-manual-panel">
      <header>
        <span>{___bsJa("Manual Resolution", "手動解決")}</span>
        <strong>{___bsJa("Developer-safe fallback", "開発者にとって安全なフォールバック")}</strong>
        <p>{___bsJa("Use these controls only for unresolved card text or tabletop corrections. Rule-driven actions must use their normal gameplay flow.", "これらのコントロールは、未解決のカード テキストまたはテーブルトップの修正にのみ使用してください。ルール主導のアクションは、通常のゲームプレイ フローを使用する必要があります。")}</p>
      </header>

      <div className={`arena-visual-manual-policy${disabled ? " is-disabled" : " is-enabled"}`}>
        <b>{disabled ? ___bsJa("Manual tools locked", "手動ツールがロックされています") : ___bsJa("Manual tools available", "手動ツールが利用可能")}</b>
        <span>{manual.reason || ___bsJa("Manual fallback policy unavailable.", "手動フォールバック ポリシーは使用できません。")}</span>
      </div>

      <div className="arena-visual-manual-section">
        <span>{___bsJa("Player State", "プレイヤーの状態")}</span>
        <div className="arena-visual-manual-grid">
          <button disabled={disabled} onClick={() => manualAction({ type: "draw", playerId: actorId, count: 1 })}>{___bsJa("Draw 1", "1枚ドロー")}</button>
          <button disabled={disabled} onClick={() => manualAction({ type: "topDeckToTrash", playerId: actorId })}>{___bsJa("Top → Trash", "デッキ上→トラッシュ")}</button>
          <button disabled={disabled} onClick={() => manualAction({ type: "revealTop", playerId: actorId })}>{___bsJa("Reveal Top", "トップを明らかにする")}</button>
          <button disabled={disabled} onClick={() => manualAction({ type: "adjustLife", playerId: actorId, delta: -1 })}>{___bsJa("−1 Life", "−1ライフ")}</button>
          <button disabled={disabled} onClick={() => manualAction({ type: "adjustLife", playerId: actorId, delta: 1 })}>{___bsJa("+1 Life", "+1ライフ")}</button>
          <button disabled={disabled} onClick={() => manualAction({ type: "voidToReserve", playerId: actorId })}>{___bsJa("Void → Core", "ボイド→コア")}</button>
        </div>
        <small>{___bsJa("Core and Soul Core corrections remain available through the physical Core click/drag system.", "Core および Soul Core の修正は、物理的な Core クリック/ドラッグ システムを通じて引き続き利用できます。")}</small>
      </div>

      <div className="arena-visual-manual-section arena-visual-manual-selected">
        <span>{___bsJa("Selected Card", "選択したカード")}</span>
        <strong>{selectedCard?.name || ___bsJa("Select one of your cards", "いずれかのカードを選択してください")}</strong>
        {selectedZone ? <small>{___bsJa("Current zone: ", "現在のゾーン: ")}{selectedZone}</small> : null}
        <div className="arena-visual-manual-grid">
          <button disabled={disabled || !selectedInstanceId} onClick={() => manualAction({ type: "temporaryBP", instanceId: selectedInstanceId, amount: 1000 })}>{___bsJa("+1000 BP", "+1000BP")}</button>
          <button disabled={disabled || !selectedInstanceId} onClick={() => manualAction({ type: "temporaryBP", instanceId: selectedInstanceId, amount: -1000 })}>{___bsJa("−1000 BP", "−1000BP")}</button>
          <button disabled={disabled || !selectedInstanceId} onClick={() => manualAction({ type: "refresh", instanceId: selectedInstanceId })}>{___bsJa("Refresh", "回復")}</button>
          <button disabled={disabled || !selectedInstanceId} onClick={() => manualAction({ type: "exhaust", instanceId: selectedInstanceId })}>{___bsJa("Exhaust", "疲労")}</button>
          <button disabled={disabled || !selectedInstanceId} onClick={() => manualAction({ type: "destroy", instanceId: selectedInstanceId })}>{___bsJa("Destroy", "破壊")}</button>
          <button disabled={disabled || !selectedInstanceId} onClick={() => manualAction({ type: "returnHand", instanceId: selectedInstanceId })}>{___bsJa("→ Hand", "→手札")}</button>
        </div>
        <div className="arena-visual-manual-move-grid">
          <button disabled={disabled || !selectedInstanceId} onClick={() => moveSelected("hand")}>{___bsJa("Move → Hand", "移動→手")}</button>
          <button disabled={disabled || !selectedInstanceId} onClick={() => moveSelected("trash")}>{___bsJa("Move → Trash", "移動 → トラッシュ")}</button>
          <button disabled={disabled || !selectedInstanceId} onClick={() => moveSelected("deck", "top")}>{___bsJa("Move → Deck Top", "移動 → デッキトップ")}</button>
          <button disabled={disabled || !selectedInstanceId} onClick={() => moveSelected("deck", "bottom")}>{___bsJa("Move → Deck Bottom", "移動 → デッキ下")}</button>
        </div>
      </div>

      <div className="arena-visual-manual-section">
        <span>{___bsJa("Revealed Cards", "公開されたカード")}</span>
        {revealed.length ? (
          <div className="arena-visual-manual-revealed">
            {revealed.map((card) => (
              <article key={card.instanceId || card.id}>
                {card.image ? <img src={card.image} alt="" draggable="false" /> : null}
                <span><strong>{card.name || card.cardId || ___bsJa("Revealed Card", "公開されたカード")}</strong><small>{card.cardId || ""}</small></span>
                <div>
                  <button disabled={disabled} onClick={() => manualAction({ type: "revealedToHand", playerId: actorId, instanceId: card.instanceId })}>{___bsJa("Hand", "手札")}</button>
                  <button disabled={disabled} onClick={() => manualAction({ type: "revealedToTop", playerId: actorId, instanceId: card.instanceId })}>{___bsJa("Top", "上")}</button>
                  <button disabled={disabled} onClick={() => manualAction({ type: "revealedToBottom", playerId: actorId, instanceId: card.instanceId })}>{___bsJa("Bottom", "下")}</button>
                </div>
              </article>
            ))}
          </div>
        ) : <p className="is-muted">{___bsJa("No cards are currently revealed.", "現在公開されているカードはありません。")}</p>}
      </div>
    </div>
  );
}

function LogPanel({ entries = [] }) {
  const { language } = useLanguage();
  const visible = [...entries].slice(-80).reverse();
  return (
    <div className="arena-visual-log-panel">
      {visible.length ? visible.map((entry, index) => (
        <article key={entry?.id || index}>
          <span>{entry?.turn ? (language === "ja" ? `ターン${entry.turn}` : `T${entry.turn}`) : ___bsJa("EVENT", "イベント")}{entry?.phase ? ` • ${language === "ja" ? japanesePhase(entry.phase) : String(entry.phase).toUpperCase()}` : ""}</span>
          <p>{language === "ja" ? japaneseGameLog(entry?.text || String(entry), cardIndex) : entry?.text || String(entry)}</p>
        </article>
      )) : <div className="arena-visual-utility-empty is-compact"><strong>{___bsJa("No match events yet", "まだ試合イベントはありません")}</strong></div>}
    </div>
  );
}

function ChatPanel({ messages = [] }) {
  return (
    <div className="arena-visual-chat-panel">
      <div className="arena-visual-chat-messages">
        {messages.length ? messages.slice(-80).map((message, index) => (
          <div key={message?.id || index} className={`arena-visual-chat-message${message?.self ? " is-self" : ""}`}>
            <span>{message?.author || ___bsJa("Player", "プレイヤー")}</span>
            <p>{message?.text || String(message)}</p>
          </div>
        )) : <div className="arena-visual-utility-empty is-compact"><strong>{___bsJa("No messages yet", "まだメッセージはありません")}</strong></div>}
      </div>
      <div className="arena-visual-chat-compose" aria-hidden="true">
        <span>{___bsJa("Message…", "メッセージ…")}</span><button type="button" tabIndex={-1}>{___bsJa("Send", "送信")}</button>
      </div>
    </div>
  );
}



function EffectDecisionPanel({ decision, onActionRequest }) {
  const [selectedIds, setSelectedIds] = useState([]);
  const [order, setOrder] = useState([]);
  const [distribution, setDistribution] = useState({});

  useEffect(() => {
    setSelectedIds([]);
    setOrder((decision?.candidates || []).map((candidate) => candidate.triggerId || candidate.instanceId || candidate.id).filter(Boolean));
    setDistribution({});
  }, [decision?.id]);

  if (!decision) return null;

  const waiting = Boolean(decision.waiting);
  const isOption = ["chooseOption", "chooseYesNo"].includes(decision.kind);
  const isOrder = ["chooseOrder", "chooseTriggerOrder"].includes(decision.kind);
  const isCoreDistribution = decision.kind === "chooseCoreDistribution";
  const isSelection = !isOption && !isOrder && !isCoreDistribution;
  const minimum = Math.max(0, Number(decision.minimum || 0));
  const maximum = Math.max(minimum, Number(decision.maximum || 1));
  const selectedBP = selectedIds.reduce((total, id) => {
    const candidate = (decision.candidates || []).find((item) => (item.instanceId || item.id) === id);
    return total + Number(candidate?.bp || 0);
  }, 0);
  const selectionReady = selectedIds.length >= minimum && selectedIds.length <= maximum && (decision.maxTotalBP == null || selectedBP <= Number(decision.maxTotalBP));
  const assigned = Object.values(distribution).reduce((sum, value) => sum + Math.max(0, Number(value || 0)), 0);
  const required = Math.max(0, Number(decision.totalCores || 0));
  const distributionReady = decision.exactTotal !== false ? assigned === required : assigned <= required;

  function resolve(payload) {
    onActionRequest?.({
      id: "resolve-effect-decision",
      type: "RESOLVE_EFFECT_DECISION",
      decisionId: decision.id,
      payload: { decisionId: decision.id, ...payload }
    });
  }

  function toggleCandidate(candidate) {
    const id = candidate.instanceId || candidate.id;
    if (!id) return;
    if (decision.kind !== "selectMultipleTargets" && maximum <= 1) {
      resolve({ selectedInstanceIds: [id] });
      return;
    }
    setSelectedIds((current) => current.includes(id)
      ? current.filter((value) => value !== id)
      : (current.length >= maximum ? current : [...current, id]));
  }

  function moveOrder(id, delta) {
    setOrder((current) => {
      const index = current.indexOf(id);
      const nextIndex = index + delta;
      if (index < 0 || nextIndex < 0 || nextIndex >= current.length) return current;
      const next = [...current];
      [next[index], next[nextIndex]] = [next[nextIndex], next[index]];
      return next;
    });
  }

  function changeDistribution(id, delta) {
    setDistribution((current) => {
      const currentValue = Math.max(0, Number(current[id] || 0));
      if (delta > 0 && assigned >= required) return current;
      const nextValue = Math.max(0, currentValue + delta);
      const next = { ...current, [id]: nextValue };
      if (!nextValue) delete next[id];
      return next;
    });
  }

  return (
    <section className="arena-visual-effect-decision" aria-live="polite">
      <header>
        <span>{___bsJa("Effect Resolution", "効果の解決")}</span>
        <strong>{decision.title || ___bsJa("Effect Resolution", "効果の解決")}</strong>
        {waiting ? <small>{___bsJa("Waiting for the other player", "他のプレイヤーを待っています")}</small> : null}
      </header>
      {decision.instruction ? <p>{decision.instruction}</p> : null}

      {!waiting && isOption ? (
        <div className="arena-visual-decision-options">
          {(decision.options || []).map((option) => (
            <button key={option.id} type="button" onClick={() => resolve({ optionId: String(option.id) })}>{option.label}</button>
          ))}
        </div>
      ) : null}

      {!waiting && isSelection ? (
        <>
          <div className="arena-visual-decision-candidates">
            {(decision.candidates || []).map((candidate) => {
              const id = candidate.instanceId || candidate.id;
              const selected = selectedIds.includes(id);
              return (
                <button key={candidate.id || id} type="button" className={selected ? "is-selected" : ""} onClick={() => toggleCandidate(candidate)}>
                  {candidate.image ? <img src={candidate.image} alt="" draggable="false" /> : null}
                  <span><strong>{candidate.name || candidate.label || ___bsJa("Choice", "選択")}</strong>{candidate.cardId ? <small>{candidate.cardId}</small> : null}</span>
                </button>
              );
            })}
          </div>
          <footer className="arena-visual-decision-footer">
            <span>{selectedIds.length}/{maximum}{decision.maxTotalBP != null ? (___bsJapanese() ? `• ${selectedBP}/${decision.maxTotalBP} BP` : ` • ${selectedBP}/${decision.maxTotalBP} BP`) : ""}</span>
            <div>
              {minimum === 0 ? <button type="button" className="is-quiet" onClick={() => resolve({ selectedInstanceIds: [] })}>{___bsJa("Choose none", "何も選択しない")}</button> : null}
              <button type="button" disabled={!selectionReady} onClick={() => resolve({ selectedInstanceIds: selectedIds })}>{___bsJa("Confirm", "確定")}</button>
            </div>
          </footer>
        </>
      ) : null}

      {!waiting && isOrder ? (
        <div className="arena-visual-decision-order">
          {order.map((id, index) => {
            const candidate = (decision.candidates || []).find((item) => (item.triggerId || item.instanceId || item.id) === id);
            return (
              <div key={id}>
                <b>{index + 1}</b>
                <span><strong>{candidate?.label || candidate?.name || id}</strong><small>{candidate?.cardId || ""}</small></span>
                <button type="button" disabled={index === 0} onClick={() => moveOrder(id, -1)}>↑</button>
                <button type="button" disabled={index === order.length - 1} onClick={() => moveOrder(id, 1)}>↓</button>
              </div>
            );
          })}
          <button type="button" className="arena-visual-decision-confirm" onClick={() => resolve(decision.kind === "chooseTriggerOrder" ? { orderedTriggerIds: order } : { orderedInstanceIds: order })}>{___bsJa("Confirm order", "順番を確定")}</button>
        </div>
      ) : null}

      {!waiting && isCoreDistribution ? (
        <div className="arena-visual-decision-core-distribution">
          {(decision.candidates || []).map((candidate) => {
            const id = candidate.instanceId || candidate.id;
            const amount = Number(distribution[id] || 0);
            return (
              <div key={id}>
                <span><strong>{candidate.name || candidate.cardId}</strong><small>{candidate.cardId || ""}</small></span>
                <button type="button" disabled={amount <= 0} onClick={() => changeDistribution(id, -1)}>−</button>
                <b>{amount}</b>
                <button type="button" disabled={assigned >= required} onClick={() => changeDistribution(id, 1)}>+</button>
              </div>
            );
          })}
          <footer className="arena-visual-decision-footer">
            <span>{assigned}/{required}{___bsJa(" Cores", " コア")}</span>
            <button type="button" disabled={!distributionReady} onClick={() => resolve({ coreDistribution: distribution })}>{___bsJa("Confirm Cores", "コアを確定")}</button>
          </footer>
        </div>
      ) : null}
    </section>
  );
}

function BattleStatusBanner({ battle }) {
  if (!battle) return null;
  return (
    <div className="arena-visual-battle-status">
      <span>{___bsJa("Battle", "戦い")}</span>
      <strong>{String(battle.stage || "battle").replaceAll("-", " ")}</strong>
      <small>{battle.blockerInstanceId ? ___bsJa("Attacker vs Blocker", "アタッカー vs ブロッカー") : (battle.attackerInstanceId ? ___bsJa("Direct attack / awaiting defense", "直接攻撃/待機防御") : ___bsJa("Battle timing", "バトルタイミング"))}</small>
    </div>
  );
}

function PendingActionBanner({ pending }) {
  if (!pending) return null;
  return (
    <div className="arena-visual-pending-action" aria-live="polite">
      <div>
        <span>{pending.label}</span>
        <strong>{pending.paid} / {pending.payableCost}{___bsJa(" Cores", " コア")}</strong>
      </div>
      {Number(pending.minimumCores || 0) > 0 ? (
        <small>{___bsJa("Minimum on card: ", "カードの最低金額: ")}{pending.minimumCores}</small>
      ) : null}
    </div>
  );
}

export default function ArenaVisualUtilityPanel({ selectedCard = null, utility = {}, onActionRequest, collapsed = false, onToggleCollapsed }) {
  const { language } = useLanguage();
  const [activeTab, setActiveTab] = useState("inspector");
  const [showGameSettings, setShowGameSettings] = useState(false);
  if (collapsed) {
    return (
      <aside className="arena-visual-utility is-collapsed" aria-label={language === "ja" ? "操作パネルを閉じています" : ___bsJa("Arena utility panel collapsed", "アリーナユーティリティパネルが崩壊")}>
        <button
          type="button"
          className="arena-visual-utility-collapse-toggle is-collapsed"
          onClick={onToggleCollapsed}
          aria-label={language === "ja" ? "操作パネルを開く" : ___bsJa("Open utility panel", "ユーティリティパネルを開く")}
          title={language === "ja" ? "パネルを開く" : ___bsJa("Open panel", "オープンパネル")}
        >
          <span aria-hidden="true">‹</span>
        </button>
      </aside>
    );
  }

  return (
    <aside className="arena-visual-utility" aria-label={language === "ja" ? "操作パネル" : ___bsJa("Arena utility panel", "アリーナユーティリティパネル")}>
      <button
        type="button"
        className="arena-visual-utility-collapse-toggle"
        onClick={onToggleCollapsed}
        aria-label={language === "ja" ? "操作パネルを閉じる" : ___bsJa("Hide utility panel", "ユーティリティパネルを非表示にする")}
        title={language === "ja" ? "パネルを閉じる" : ___bsJa("Hide panel", "パネルを非表示にする")}
      >
        <span aria-hidden="true">›</span>
      </button>
      <nav className="arena-visual-utility-tabs" aria-label={language === "ja" ? "操作パネルのメニュー" : ___bsJa("Utility navigation", "ユーティリティナビゲーション")}>
        {TABS.map(([id, label]) => (
          <button key={id} type="button" className={activeTab === id ? "is-active" : ""} onClick={() => setActiveTab(id)}>
            {language === "ja" ? ({ inspector: "カード", manual: "手動", log: "履歴", chat: "チャット" }[id] || label) : label}
          </button>
        ))}
      </nav>

      <div className="arena-visual-utility-main" data-active-tab={showGameSettings ? "settings" : activeTab}>
        {showGameSettings ? (
          <section className="arena-visual-game-settings">
            <span>{language === "ja" ? "対戦画面" : ___bsJa("Game Settings", "ゲーム設定")}</span>
            <strong>{language === "ja" ? "表示設定" : ___bsJa("Match interface", "インターフェースの一致")}</strong>
            <button type="button" onClick={onToggleCollapsed}>{language === "ja" ? "パネルを閉じる" : ___bsJa("Hide Utility Panel", "ユーティリティパネルを隠す")}</button>
            <button type="button" className="is-quiet" onClick={() => setShowGameSettings(false)}>{language === "ja" ? "戻る" : ___bsJa("Close Settings", "設定を閉じる")}</button>
          </section>
        ) : null}
        {!showGameSettings && activeTab === "inspector" ? <InspectorPanel card={selectedCard} /> : null}
        {!showGameSettings && activeTab === "manual" ? <ManualPanel selectedCard={selectedCard} utility={utility} onActionRequest={onActionRequest} /> : null}
        {!showGameSettings && activeTab === "log" ? <LogPanel entries={utility?.logEntries || []} /> : null}
        {!showGameSettings && activeTab === "chat" ? <ChatPanel messages={utility?.chatMessages || []} /> : null}
      </div>

      <div className="arena-visual-system-actions" aria-label={language === "ja" ? "対戦の設定と終了" : ___bsJa("Game system actions", "ゲームシステムのアクション")}>
        <button
          type="button"
          onClick={() => setShowGameSettings((value) => !value)}
        >
          {language === "ja" ? "表示設定" : ___bsJa("Game Settings", "ゲーム設定")}
        </button>
        <button
          type="button"
          className="is-danger"
          onClick={() => onActionRequest?.({ id: "surrender-match", type: "SURRENDER_MATCH", label: "Surrender" })}
        >
          {language === "ja" ? "降参" : ___bsJa("Surrender", "降伏")}
        </button>
      </div>
    </aside>
  );
}
