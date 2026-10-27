import { japaneseDeckIssue } from "../../localization/deckIssues.js";
import { getDisplayCardName as getCardName } from "../../localization/displayCardName.js";
import { japaneseText as ___bsJa } from "../../localization/displayLanguage.js";
import { getJapaneseFamily } from "../../localization/cardText.js";
import PointerTiltSurface from "../../components/layout/PointerTiltSurface.jsx";
import EternalCinematicBackdrop from "../../components/layout/EternalCinematicBackdrop.jsx";
import { useDeferredValue, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import CardTile from "../../components/cards/CardTile.jsx";
import EmptyState from "../../components/common/EmptyState.jsx";
import CardDetailsModal from "../../components/cards/CardDetailsModal.jsx";
import { searchCards, cardIndex, catalogMeta, getRelatedCards } from "../../services/cards/cardRepository.js";
import { analyzeDeck, COLOR_ORDER, TYPE_ORDER } from "./services/deckAnalytics.js";
import { deleteDeck, getDecks, upsertDeck } from "../../services/platform/storage.js";
import { validateDeck } from "../../game/state.js";
import {  resolveCardImage, resolveCardThumbnail } from "../../game/cardAdapter.js";
import {
  ETERNAL_OFFICIAL_LIST_DATE,
  copyLimitForCard,
  eternalDeckNameKey,
  officialRestrictionSummary
} from "../../game/eternalDeckRules.js";
import { useLanguage } from "../../localization/i18n.jsx";
import { MAX_OWNED_COPIES, collectionQuantityMap, loadEconomySnapshot } from "../../services/economy/economyService.js";

import "../../styles/deckbuilder/deckBuilderPagination.css";
import "../../styles/deckbuilder/deckImportExport.css";
import "../../styles/deckbuilder/deckBuilderV3.css";
import "../../styles/deckbuilder/deckBuilderV398.css";
import "../../styles/pages/eternalInterfaceV350.css";

const CARDS_PER_PAGE = 21;
const JAPANESE_COLORS = { red: "赤", purple: "紫", green: "緑", white: "白", yellow: "黄", blue: "青" };
const JAPANESE_TYPES = { spirit: "スピリット", brave: "ブレイヴ", ultimate: "アルティメット", nexus: "ネクサス", magic: "マジック" };
const DECK_FILE_FORMAT = "battle-spirits-eternal-deck";
const DECK_FILE_VERSION = 1;

function getPaginationItems(currentPage, totalPages) {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  if (currentPage <= 4) {
    return [1, 2, 3, 4, 5, "ellipsis-right", totalPages];
  }

  if (currentPage >= totalPages - 3) {
    return [1, "ellipsis-left", totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
  }

  return [1, "ellipsis-left", currentPage - 1, currentPage, currentPage + 1, "ellipsis-right", totalPages];
}

function safeFileName(value) {
  const cleaned = String(value || "deck")
    .trim()
    .replace(/[<>:"/\\|?*\u0000-\u001F]/g, "-")
    .replace(/\s+/g, " ")
    .slice(0, 80);

  return cleaned || "deck";
}

function normalizeImportedCards(entries) {
  const merged = new Map();
  let ignored = 0;

  for (const entry of Array.isArray(entries) ? entries : []) {
    const cardId = String(entry?.cardId || entry?.id || "").trim();
    const quantity = Math.floor(Number(entry?.quantity ?? entry?.qty ?? entry?.count ?? 0));

    if (!cardId || !Number.isFinite(quantity) || quantity <= 0) {
      ignored += 1;
      continue;
    }

    if (!cardIndex.has(cardId)) {
      ignored += 1;
      continue;
    }

    merged.set(cardId, (merged.get(cardId) || 0) + quantity);
  }

  return {
    cards: Array.from(merged.entries()).map(([cardId, quantity]) => ({ cardId, quantity })),
    ignored
  };
}

export default function DeckBuilder({ onBack, deckId = null }) {
  const { t, language } = useLanguage();
  const pt = language !== "en";

  const initialDecksRef = useRef(null);
  if (initialDecksRef.current === null) initialDecksRef.current = getDecks();
  const initialDecks = initialDecksRef.current;
  const requested = initialDecks.find((d) => d.id === deckId) || null;

  const [decks, setDecks] = useState(initialDecks);
  const [draft, setDraft] = useState(
    requested || {
      id: null,
      name: t("newDeck"),
      cards: [],
      coverCardId: null
    }
  );
  const [query, setQuery] = useState("");
  const deferredQuery = useDeferredValue(query);
  const [type, setType] = useState("");
  const [color, setColor] = useState("");
  const [setCode, setSetCode] = useState("");
  const [rarity, setRarity] = useState("");
  const [family, setFamily] = useState("");
  const [costMin, setCostMin] = useState("");
  const [costMax, setCostMax] = useState("");
  const [reduction, setReduction] = useState("");
  const [symbol, setSymbol] = useState("");
  const [restriction, setRestriction] = useState("");
  const [sort, setSort] = useState("code");
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [detailsCard, setDetailsCard] = useState(null);
  const [transferNotice, setTransferNotice] = useState(null);
  const [economySnapshot, setEconomySnapshot] = useState({ collection: [] });

  const browserRef = useRef(null);
  const importInputRef = useRef(null);

  useEffect(() => {
    let active = true;
    const refresh = () => loadEconomySnapshot().then((next) => { if (active) setEconomySnapshot(next); });
    refresh();
    window.addEventListener("bs:economy-changed", refresh);
    return () => { active = false; window.removeEventListener("bs:economy-changed", refresh); };
  }, []);

  const ownedById = useMemo(() => collectionQuantityMap(economySnapshot.collection), [economySnapshot.collection]);
  const ownedQuantity = (cardId) => ownedById.get(cardId) || 0;

  const results = useMemo(
    () => searchCards(deferredQuery, {
      cardType: type || undefined,
      color: color || undefined,
      set: setCode || undefined,
      rarity: rarity || undefined,
      family: family || undefined,
      costMin,
      costMax,
      reduction: reduction || undefined,
      symbol: symbol || undefined,
      restriction: restriction || undefined,
      sort
    }),
    [deferredQuery, type, color, setCode, rarity, family, costMin, costMax, reduction, symbol, restriction, sort]
  );

  const totalPages = Math.max(1, Math.ceil(results.length / CARDS_PER_PAGE));
  const currentPage = Math.min(page, totalPages);
  const pageStartIndex = (currentPage - 1) * CARDS_PER_PAGE;

  const pageResults = useMemo(
    () => results.slice(pageStartIndex, pageStartIndex + CARDS_PER_PAGE),
    [results, pageStartIndex]
  );

  const paginationItems = useMemo(
    () => getPaginationItems(currentPage, totalPages),
    [currentPage, totalPages]
  );

  const rangeStart = results.length ? pageStartIndex + 1 : 0;
  const rangeEnd = results.length ? Math.min(pageStartIndex + CARDS_PER_PAGE, results.length) : 0;

  useEffect(() => {
    const nextStart = currentPage * CARDS_PER_PAGE;
    const nextCards = results.slice(nextStart, nextStart + CARDS_PER_PAGE);
    if (!nextCards.length) return undefined;

    const prefetch = () => {
      nextCards.forEach((card) => {
        const image = new Image();
        image.decoding = "async";
        image.src = resolveCardThumbnail(card);
      });
    };

    if (typeof window.requestIdleCallback === "function") {
      const id = window.requestIdleCallback(prefetch, { timeout: 2500 });
      return () => window.cancelIdleCallback?.(id);
    }

    const id = window.setTimeout(prefetch, 900);
    return () => window.clearTimeout(id);
  }, [results, currentPage]);

  const validation = useMemo(
    () => validateDeck(draft.cards, cardIndex, { regulation: "eternal" }),
    [draft.cards]
  );
  const officialValidation = useMemo(
    () => validateDeck(draft.cards, cardIndex, { regulation: "official" }),
    [draft.cards]
  );

  const deckQuantityById = useMemo(() => {
    const map = new Map();
    for (const entry of draft.cards) {
      const id = entry.cardId || entry.id;
      if (!id) continue;
      map.set(id, Number(entry.quantity || 0));
    }
    return map;
  }, [draft.cards]);

  const deckCardIds = useMemo(
    () => draft.cards
      .filter((e) => Number(e.quantity || 0) > 0)
      .map((e) => e.cardId || e.id),
    [draft.cards]
  );

  const uniqueCards = deckCardIds.length;
  const coverCard = useMemo(
    () => cardIndex.get(draft.coverCardId || draft.cards[0]?.cardId || draft.cards[0]?.id || ""),
    [draft.coverCardId, draft.cards]
  );
  const hasDeck = draft.cards.length > 0;
  const analytics = useMemo(() => analyzeDeck(draft.cards, cardIndex), [draft.cards]);
  const maxCurve = useMemo(() => Math.max(1, ...analytics.costCurve), [analytics.costCurve]);
  const relatedCards = useMemo(() => getRelatedCards(detailsCard, { limit: 6 }), [detailsCard]);
  const activeAdvancedFilters = [setCode, rarity, family, costMin, costMax, reduction, symbol, restriction].filter((value) => String(value ?? "").trim() !== "").length;

  function qty(cardId) {
    return deckQuantityById.get(cardId) || 0;
  }

  function setQty(cardId, nextQty) {
    const card = cardIndex.get(cardId);
    if (!card) return;

    const sameNameCount = draft.cards.reduce((sum, e) => {
      const c = cardIndex.get(e.cardId || e.id);
      return eternalDeckNameKey(c) === eternalDeckNameKey(card)
        ? sum + Number(e.quantity || 0)
        : sum;
    }, 0) - qty(cardId);

    const cardLimit = copyLimitForCard(card, { official: false, fallbackMaxSameName: 3 });
    const ownedLimit = ownedQuantity(cardId);
    const allowed = Math.max(0, Math.min(cardLimit - sameNameCount, ownedLimit, nextQty));

    setDraft((d) => {
      const cards = [
        ...d.cards.filter((e) => (e.cardId || e.id) !== cardId),
        ...(allowed ? [{ cardId, quantity: allowed }] : [])
      ];

      const coverCardId = allowed === 0 && d.coverCardId === cardId ? cards[0]?.cardId || null : d.coverCardId;
      return { ...d, cards, coverCardId };
    });
  }

  function save() {
    const id = upsertDeck({
      ...draft,
      coverCardId: draft.coverCardId || draft.cards[0]?.cardId || null
    });

    const next = getDecks();
    setDecks(next);
    setDraft(next.find((d) => d.id === id));
    setTransferNotice({ type: "success", text: language === "ja" ? "デッキを保存しました。" : pt ? "Deck salvo." : "Deck saved." });
  }

  function fresh() {
    setDraft({ id: null, name: t("newDeck"), cards: [], coverCardId: null });
    setTransferNotice(null);
  }

  function remove() {
    if (!draft.id) return;
    deleteDeck(draft.id);
    setDecks(getDecks());
    fresh();
  }

  function exportDeck() {
    if (!draft.cards.length) {
      setTransferNotice({
        type: "error",
        text: language === "ja" ? "書き出す前にカードを1枚以上追加してください。" : pt ? "Adicione pelo menos uma carta antes de exportar." : "Add at least one card before exporting."
      });
      return;
    }

    const payload = {
      format: DECK_FILE_FORMAT,
      version: DECK_FILE_VERSION,
      simulator: "Battle Spirits: KAIHOU! Simulator",
      simulatorVersion: "4.2.2",
      exportedAt: new Date().toISOString(),
      deck: {
        name: String(draft.name || "").trim() || (language === "ja" ? "読み込んだデッキ" : pt ? "Deck Importado" : "Imported Deck"),
        coverCardId: draft.coverCardId || draft.cards[0]?.cardId || null,
        cards: draft.cards.map((entry) => ({
          cardId: entry.cardId || entry.id,
          quantity: Number(entry.quantity || 0)
        }))
      }
    };

    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `${safeFileName(draft.name)}.bsdeck.json`;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    setTimeout(() => URL.revokeObjectURL(url), 0);

    setTransferNotice({ type: "success", text: language === "ja" ? "デッキを書き出しました。" : pt ? "Deck exportado com sucesso." : "Deck exported successfully." });
  }

  async function importDeckFile(file) {
    if (!file) return;

    try {
      const rawText = await file.text();
      const parsed = JSON.parse(rawText);
      const imported = parsed?.deck && (parsed.format === DECK_FILE_FORMAT || parsed.deck.cards) ? parsed.deck : parsed;

      if (!imported || !Array.isArray(imported.cards)) {
        throw new Error(language === "ja" ? "このファイルに有効なデッキがありません。" : pt ? "Este arquivo não contém um deck válido." : "This file does not contain a valid deck.");
      }

      const normalized = normalizeImportedCards(imported.cards);
      let ignored = normalized.ignored;
      const cards = normalized.cards
        .map((entry) => {
          const owned = ownedQuantity(entry.cardId);
          if (owned <= 0) { ignored += 1; return null; }
          return { ...entry, quantity: Math.min(entry.quantity, owned) };
        })
        .filter(Boolean);

      if (!cards.length) {
        throw new Error(language === "ja" ? "このファイルに対応するカードが見つかりませんでした。" : pt ? "Nenhuma carta compatível foi encontrada neste arquivo." : "No compatible cards were found in this file.");
      }

      const importedCoverId = String(imported.coverCardId || "").trim();
      const coverCardId = importedCoverId && cards.some((entry) => entry.cardId === importedCoverId)
        ? importedCoverId
        : cards[0]?.cardId || null;

      const name = String(imported.name || "").trim() || (language === "ja" ? "読み込んだデッキ" : pt ? "Deck Importado" : "Imported Deck");

      setDraft({ id: null, name, cards, coverCardId });
      setQuery("");
      setType("");
      setColor("");
      setSetCode("");
      setRarity("");
      setFamily("");
      setCostMin("");
      setCostMax("");
      setReduction("");
      setSymbol("");
      setRestriction("");
      setPage(1);

      setTransferNotice({
        type: ignored > 0 ? "warning" : "success",
        text: language === "ja"
          ? (ignored > 0 ? `デッキを読み込みました。${ignored}件の無効または未対応の項目を除外しました。内容を確認して保存してください。` : "デッキを読み込みました。内容を確認して保存してください。")
          : pt
          ? (ignored > 0
            ? `Deck importado. ${ignored} entrada${ignored === 1 ? "" : "s"} inválida${ignored === 1 ? "" : "s"} ou sem suporte ${ignored === 1 ? "foi ignorada" : "foram ignoradas"}. Revise e clique em Salvar.`
            : "Deck importado. Revise e clique em Salvar.")
          : (ignored > 0
            ? `Deck imported. ${ignored} unsupported or invalid entr${ignored === 1 ? "y was" : "ies were"} ignored. Review it and click Save.`
            : "Deck imported. Review it and click Save.")
      });
    } catch (error) {
      console.error("Falha ao importar deck:", error);
      setTransferNotice({
        type: "error",
        text: language === "ja" ? "デッキを読み込めませんでした。ファイルを確認して再度お試しください。" : pt ? "Não foi possível importar este deck. Verifique o arquivo e tente novamente." : "Could not import this deck. Check the file and try again."
      });
    } finally {
      if (importInputRef.current) importInputRef.current.value = "";
    }
  }

  function changeQuery(value) {
    setQuery(value);
    setPage(1);
  }

  function changeType(value) {
    setType(value);
    setPage(1);
  }

  function changeColor(value) {
    setColor(value);
    setPage(1);
  }

  function changeFilter(setter, value) {
    setter(value);
    setPage(1);
  }

  function clearFilters() {
    setQuery("");
    setType("");
    setColor("");
    setSetCode("");
    setRarity("");
    setFamily("");
    setCostMin("");
    setCostMax("");
    setReduction("");
    setSymbol("");
    setRestriction("");
    setSort("code");
    setPage(1);
  }

  function goToPage(nextPage) {
    const boundedPage = Math.max(1, Math.min(totalPages, nextPage));
    setPage(boundedPage);
    requestAnimationFrame(() => {
      browserRef.current?.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  return (
    <main className="deck-page deck-builder-v3-page eternal-page eternal-builder-page">
      <EternalCinematicBackdrop compact />
      <header className="page-header deck-builder-v3-topbar">
        <button className="ghost deck-builder-v3-back eternal-menu-action" onClick={onBack}>
          {t("back")}
        </button>

        <div className="deck-builder-v3-title">
          <span className="eyebrow">{t("deckBuilder")}</span>
          <h1>{t("eternalFormat")}</h1>
          <p>{pt ? ___bsJa("Monte, edite e organize seus decks com mais clareza.", "デッキをより明確に構築、編集、整理します。") : ___bsJa("Build, edit and organize your decks more clearly.", "デッキをより明確に構築、編集、整理します。")}</p>
        </div>

        <div className="row-actions deck-builder-actions deck-builder-v3-actions">
          <input
            ref={importInputRef}
            className="deck-import-input"
            hidden
            type="file"
            accept=".json,.bsdeck.json,application/json"
            onChange={(event) => importDeckFile(event.target.files?.[0])}
          />

          <button className="ghost deck-transfer-btn" onClick={() => importInputRef.current?.click()}>
            {pt ? ___bsJa("Importar Deck", "インポートデッキ") : ___bsJa("Import Deck", "インポートデッキ")}
          </button>

          <button className="ghost deck-transfer-btn" disabled={!draft.cards.length} onClick={exportDeck}>
            {pt ? ___bsJa("Exportar Deck", "デッキのエクスポート") : ___bsJa("Export Deck", "デッキのエクスポート")}
          </button>

          <button className="ghost eternal-menu-action compact" onClick={fresh}>{t("newDeck")}</button>
          <button className="primary-btn eternal-menu-action compact active" onClick={save}>{t("save")}</button>
        </div>
      </header>

      {transferNotice && (
        <div className={`deck-transfer-notice ${transferNotice.type}`}>
          <span>{transferNotice.text}</span>
          <button type="button" aria-label={pt ? ___bsJa("Fechar", "閉じる") : ___bsJa("Close", "閉じる")} onClick={() => setTransferNotice(null)}>×</button>
        </div>
      )}

      <div className="deck-layout deck-builder-v3-layout">
        <aside className="panel deck-sidebar deck-builder-v3-sidebar">
          <div className="deck-builder-v3-cover-panel">
            <PointerTiltSurface className="deck-builder-v3-cover-tilt" maxTilt={4.4}>
              <div className="deck-builder-v3-cover-frame">
              {coverCard ? (
                <img
                  src={resolveCardThumbnail(coverCard)}
                  alt={getCardName(coverCard)}
                  draggable="false"
                  loading="lazy"
                  decoding="async"
                  fetchPriority="low"
                  onError={(event) => {
                    if (event.currentTarget.dataset.fullFallback === "true") return;
                    event.currentTarget.dataset.fullFallback = "true";
                    event.currentTarget.src = resolveCardImage(coverCard);
                  }}
                />
              ) : (
                <div className="deck-builder-v3-cover-empty">
                  <span>◇</span>
                  <b>{pt ? ___bsJa("Sem capa", "カバーなし") : ___bsJa("No cover", "カバーなし")}</b>
                  <small>{pt ? ___bsJa("Adicione cartas para escolher uma capa.", "カードを追加して表紙を選択します。") : ___bsJa("Add cards to choose a cover.", "カードを追加して表紙を選択します。")}</small>
                </div>
              )}
              </div>
            </PointerTiltSurface>

            <div className="deck-builder-v3-cover-copy">
              <span>{pt ? ___bsJa("Deck atual", "現在のデッキ") : ___bsJa("Current deck", "現在のデッキ")}</span>
              <strong>{String(draft.name || "").trim() || t("newDeck")}</strong>
              <small>{coverCard ? getCardName(coverCard) : (pt ? ___bsJa("Nenhuma carta de capa definida", "カバーカードが選択されていません") : ___bsJa("No cover card selected", "カバーカードが選択されていません"))}</small>
            </div>
          </div>

          <div className="deck-builder-v3-summary">
            <div>
              <strong>{validation.size}</strong>
              <span>{t("cards")}</span>
            </div>
            <div>
              <strong>{uniqueCards}</strong>
              <span>{pt ? ___bsJa("Únicas", "種類") : ___bsJa("Unique", "種類")}</span>
            </div>
            <div className={validation.ok ? "ok" : "warn"}>
              <strong>{validation.ok ? (pt ? "OK" : "OK") : (pt ? ___bsJa("REV", "要確認") : ___bsJa("REV", "要確認"))}</strong>
              <span>{validation.ok ? t("validDeck") : (pt ? ___bsJa("Revisar", "確認") : ___bsJa("Review", "確認"))}</span>
            </div>
          </div>

          <section className="deck-builder-v3-section">
            <div className="deck-builder-v3-section-head">
              <h3>{pt ? ___bsJa("Configuração do deck", "デッキセットアップ") : ___bsJa("Deck setup", "デッキセットアップ")}</h3>
            </div>

            <label>
              {t("name")}
              <input
                value={draft.name}
                onChange={(e) => setDraft({ ...draft, name: e.target.value })}
              />
            </label>

            <label>
              {t("deckCover")}
              <select
                value={draft.coverCardId || ""}
                onChange={(e) => setDraft({ ...draft, coverCardId: e.target.value || null })}
              >
                <option value="">—</option>
                {deckCardIds.map((id) => (
                  <option key={id} value={id}>{getCardName(cardIndex.get(id))}</option>
                ))}
              </select>
            </label>

            <div className="deck-validation deck-builder-v3-validation">
              <strong>{validation.size} {t("cards")}</strong>
              {validation.ok ? (
                <span className="success-text">{___bsJa("✓ Válido no formato Eternal", "✓ エターナルフォーマットで有効")}</span>
              ) : (
                validation.issues.filter((issue) => issue.severity === "error").map((issue, index) => (
                  <span className="error-text" key={`${issue.code}-${index}`}>{language === "ja" ? japaneseDeckIssue(issue, cardIndex) : issue.message}</span>
                ))
              )}
              {validation.ok && (
                <div className={`deck-regulation-status ${officialValidation.ok ? "is-valid" : "is-warning"}`}>
                  <b>{officialValidation.ok ? ___bsJa("✓ Apto ao regulamento oficial", "✓ 公的規制に準拠") : ___bsJa("Regulamento oficial · revisar", "公式レギュレーション・見直し")}</b>
                  {!officialValidation.ok && (
                    <>
                      <small>{___bsJa("Lista vigente em ", "現在のリスト ")}{ETERNAL_OFFICIAL_LIST_DATE.split("-").reverse().join("/")}</small>
                      {officialValidation.issues.filter((issue) => issue.severity === "error").map((issue, index) => <span key={`${issue.code}-${index}`}>{language === "ja" ? japaneseDeckIssue(issue, cardIndex) : issue.message}</span>)}
                    </>
                  )}
                </div>
              )}
            </div>
          </section>

          <section className="deck-builder-v3-section deck-builder-v398-analytics">
            <div className="deck-builder-v3-section-head deck-builder-v3-section-head-inline">
              <h3>{pt ? ___bsJa("Análise do deck", "デッキ分析") : ___bsJa("Deck analysis", "デッキ分析")}</h3>
              <small>{analytics.averageCost.toFixed(1)} {pt ? ___bsJa("custo médio", "平均コスト") : ___bsJa("avg cost", "平均コスト")}</small>
            </div>

            <div className="deck-v398-curve" aria-label={pt ? ___bsJa("Curva de custo", "コストカーブ") : ___bsJa("Cost curve", "コストカーブ")}>
              {analytics.costCurve.map((count, index) => (
                <div className="deck-v398-curve-col" key={index}>
                  <span className="deck-v398-curve-value">{count}</span>
                  <i style={{ height: `${Math.max(4, (count / maxCurve) * 46)}px` }} />
                  <b>{index === 7 ? "7+" : index}</b>
                </div>
              ))}
            </div>

            <div className="deck-v398-breakdown">
              <div>
                <span>{pt ? ___bsJa("Cores", "色") : ___bsJa("Colors", "色")}</span>
                <div className="deck-v398-color-row">
                  {COLOR_ORDER.filter((entry) => analytics.colors[entry] > 0).map((entry) => (
                    <i key={entry} className={`deck-v398-color-dot ${entry}`} title={`${language === "ja" ? JAPANESE_COLORS[entry] : entry}: ${analytics.colors[entry]}`}>
                      {analytics.colors[entry]}
                    </i>
                  ))}
                  {!analytics.dominantColors.length && <small>—</small>}
                </div>
              </div>
              <div>
                <span>{pt ? ___bsJa("Tipos", "種類") : ___bsJa("Types", "種類")}</span>
                <div className="deck-v398-type-row">
                  {TYPE_ORDER.filter((entry) => analytics.types[entry] > 0).map((entry) => (
                    <small key={entry}><b>{analytics.types[entry]}</b> {language === "ja" ? JAPANESE_TYPES[entry] : entry}</small>
                  ))}
                  {!analytics.total && <small>—</small>}
                </div>
              </div>
            </div>
          </section>

          <section className="deck-builder-v3-section">
            <div className="deck-builder-v3-section-head deck-builder-v3-section-head-inline">
              <h3>{t("myDecks")}</h3>
              <small>{decks.length}</small>
            </div>

            <div className="saved-decks deck-builder-v3-saved-decks">
              {decks.length ? decks.map((d) => (
                <button
                  key={d.id}
                  className={d.id === draft.id ? "active" : ""}
                  onClick={() => setDraft(d)}
                >
                  <span>
                    <b>{d.name}</b>
                    <small>{d.cards.reduce((s, e) => s + Number(e.quantity || 0), 0)} {t("cards")}</small>
                  </span>
                  <em>{d.cards.length}</em>
                </button>
              )) : (
                <div className="deck-builder-v3-empty-list">{pt ? ___bsJa("Nenhum deck salvo ainda.", "まだ保存されたデッキはありません。") : ___bsJa("No saved decks yet.", "まだ保存されたデッキはありません。")}</div>
              )}
            </div>

            {draft.id && (
              <button className="danger ghost deck-builder-v3-delete" onClick={remove}>
                {t("deleteDeck")}
              </button>
            )}
          </section>

          <section className="deck-builder-v3-section deck-builder-v3-current-list-section">
            <div className="deck-builder-v3-section-head deck-builder-v3-section-head-inline">
              <h3>{t("currentList")}</h3>
              <small>{validation.size}</small>
            </div>

            <div className="deck-list deck-builder-v3-current-list">
              {hasDeck ? draft.cards.map((e) => {
                const c = cardIndex.get(e.cardId || e.id);
                return (
                  <button
                    className={`deck-list-row ${draft.coverCardId === (e.cardId || e.id) ? "cover" : ""}`}
                    key={e.cardId || e.id}
                    onClick={() => setDraft({ ...draft, coverCardId: e.cardId || e.id })}
                  >
                    <span>{getCardName(c)}</span>
                    <b>x{e.quantity}</b>
                  </button>
                );
              }) : (
                <div className="deck-builder-v3-empty-list">{pt ? ___bsJa("Adicione cartas para começar seu deck.", "カードを追加してデッキを開始します。") : ___bsJa("Add cards to start your deck.", "カードを追加してデッキを開始します。")}</div>
              )}
            </div>
          </section>
        </aside>

        <section ref={browserRef} className="panel card-browser deck-builder-v3-browser">
          <div className="deck-builder-v3-browser-toolbar deck-v398-browser-toolbar">
            <div className="deck-v398-search-row">
              <label className="deck-v398-search">
                <span className="sr-only">{t("searchCards")}</span>
                <input
                  placeholder={pt ? ___bsJa("Buscar por nome, código, família ou efeito...", "名前、コード、ファミリー、効果を検索...") : ___bsJa("Search name, code, family or effect...", "名前、コード、ファミリー、効果を検索...")}
                  value={query}
                  onChange={(e) => changeQuery(e.target.value)}
                />
              </label>

              <select value={type} onChange={(e) => changeType(e.target.value)} aria-label={pt ? ___bsJa("Tipo", "種類") : ___bsJa("Type", "種類")}>
                <option value="">{t("allTypes")}</option>
                <option value="spirit">{___bsJa("Spirit", "スピリット")}</option>
                <option value="brave">{___bsJa("Brave", "ブレイヴ")}</option>
                <option value="ultimate">{___bsJa("Ultimate", "アルティメット")}</option>
                <option value="nexus">{___bsJa("Nexus", "ネクサス")}</option>
                <option value="magic">{___bsJa("Magic", "マジック")}</option>
              </select>

              <select value={color} onChange={(e) => changeColor(e.target.value)} aria-label={pt ? ___bsJa("Cor", "色") : ___bsJa("Color", "色")}>
                <option value="">{t("allColors")}</option>
                {["red", "purple", "green", "white", "yellow", "blue"].map((c) => (
                  <option key={c} value={c}>{language === "ja" ? JAPANESE_COLORS[c] : c}</option>
                ))}
              </select>

              <button
                type="button"
                className={`ghost deck-v398-filter-toggle ${advancedOpen ? "active" : ""}`}
                onClick={() => setAdvancedOpen((value) => !value)}
                aria-expanded={advancedOpen}
              >
                {pt ? ___bsJa("Filtros", "フィルター") : ___bsJa("Filters", "フィルター")}
                {activeAdvancedFilters > 0 && <b>{activeAdvancedFilters}</b>}
              </button>
            </div>

            {advancedOpen && (
              <div className="deck-v398-advanced">
                <select value={setCode} onChange={(e) => changeFilter(setSetCode, e.target.value)}>
                  <option value="">{pt ? ___bsJa("Todos os sets", "すべてのセット") : ___bsJa("All sets", "すべてのセット")}</option>
                  {catalogMeta.sets.map((value) => <option key={value} value={value}>{value}</option>)}
                </select>
                <select value={rarity} onChange={(e) => changeFilter(setRarity, e.target.value)}>
                  <option value="">{pt ? ___bsJa("Todas as raridades", "すべてのレアリティ") : ___bsJa("All rarities", "すべてのレアリティ")}</option>
                  {catalogMeta.rarities.map((value) => <option key={value} value={value}>{value}</option>)}
                </select>
                <select value={family} onChange={(e) => changeFilter(setFamily, e.target.value)}>
                  <option value="">{pt ? ___bsJa("Todas as famílias", "すべての系統") : ___bsJa("All families", "すべての系統")}</option>
                  {catalogMeta.families.map((value) => <option key={value} value={value}>{language === "ja" ? getJapaneseFamily(value) : value}</option>)}
                </select>
                <select value={reduction} onChange={(e) => changeFilter(setReduction, e.target.value)}>
                  <option value="">{pt ? ___bsJa("Qualquer redução", "すべての軽減") : ___bsJa("Any reduction", "すべての軽減")}</option>
                  {catalogMeta.reductions.map((value) => <option key={value} value={value}>{language === "ja" ? JAPANESE_COLORS[value] || value : value}</option>)}
                </select>
                <select value={symbol} onChange={(e) => changeFilter(setSymbol, e.target.value)}>
                  <option value="">{pt ? ___bsJa("Qualquer símbolo", "すべてのシンボル") : ___bsJa("Any symbol", "すべてのシンボル")}</option>
                  {catalogMeta.symbols.map((value) => <option key={value} value={value}>{language === "ja" ? JAPANESE_COLORS[value] || value : value}</option>)}
                </select>
                <select value={restriction} onChange={(e) => changeFilter(setRestriction, e.target.value)}>
                  <option value="">{pt ? ___bsJa("Qualquer legalidade", "すべての制限") : ___bsJa("Any legality", "すべての制限")}</option>
                  <option value="clean">{pt ? ___bsJa("Sem restrição", "無制限") : ___bsJa("Unrestricted", "無制限")}</option>
                  <option value="restricted">{pt ? ___bsJa("Proibidas / limitadas", "禁止・制限あり") : ___bsJa("Banned / limited", "禁止・制限あり")}</option>
                  <option value="banned">{pt ? ___bsJa("Somente proibidas", "禁止のみ") : ___bsJa("Banned only", "禁止のみ")}</option>
                </select>
                <div className="deck-v398-cost-range">
                  <span>{pt ? ___bsJa("Custo", "コスト") : ___bsJa("Cost", "コスト")}</span>
                  <input type="number" min="0" max="99" placeholder={___bsJa("Min", "最小")} value={costMin} onChange={(e) => changeFilter(setCostMin, e.target.value)} />
                  <em>—</em>
                  <input type="number" min="0" max="99" placeholder={___bsJa("Max", "最大")} value={costMax} onChange={(e) => changeFilter(setCostMax, e.target.value)} />
                </div>
                <select value={sort} onChange={(e) => changeFilter(setSort, e.target.value)}>
                  <option value="code">{pt ? ___bsJa("Ordenar por código", "コードで並べ替える") : ___bsJa("Sort by code", "コードで並べ替える")}</option>
                  <option value="name">{pt ? ___bsJa("Ordenar por nome", "名前順に並べ替える") : ___bsJa("Sort by name", "名前順に並べ替える")}</option>
                  <option value="cost">{pt ? ___bsJa("Ordenar por custo", "コスト順に並べ替える") : ___bsJa("Sort by cost", "コスト順に並べ替える")}</option>
                  <option value="rarity">{pt ? ___bsJa("Ordenar por raridade", "レアリティ順に並べ替える") : ___bsJa("Sort by rarity", "レアリティ順に並べ替える")}</option>
                </select>
                <button type="button" className="ghost deck-v398-clear" onClick={clearFilters}>{pt ? ___bsJa("Limpar filtros", "フィルターをクリアする") : ___bsJa("Clear filters", "フィルターをクリアする")}</button>
              </div>
            )}

            <div className="deck-browser-meta deck-builder-v3-meta">
              <span>
                {language === "ja" ? (
                  <>全{results.length}件中 <b>{rangeStart}〜{rangeEnd}件</b>を表示</>
                ) : pt ? (
                  <>{___bsJa("Mostrando ", "表示中 ")}<b>{rangeStart}–{rangeEnd}</b>{___bsJa(" de ", " の ")}<b>{results.length}</b>{___bsJa(" cartas", " カード")}</>
                ) : (
                  <>{___bsJa("Showing ", "表示中 ")}<b>{rangeStart}–{rangeEnd}</b>{___bsJa(" of ", " の ")}<b>{results.length}</b>{___bsJa(" cards", " カード")}</>
                )}
              </span>
              <span>{pt ? ___bsJa("Catálogo", "カタログ") : ___bsJa("Catalog", "カタログ")}: <b>{cardIndex.size}</b> · {pt ? ___bsJa("Página", "ページ") : ___bsJa("Page", "ページ")} <b>{currentPage}</b> / <b>{totalPages}</b></span>
            </div>
          </div>

          {!results.length ? (
            <EmptyState title={t("noCardsFound")}>{language === "en" ? ___bsJa("Try changing the filters or search.", "フィルターを変更するか検索してみてください。") : ___bsJa("Tente alterar os filtros ou a busca.", "フィルターを変更するか検索してみてください。")}</EmptyState>
          ) : (
            <>
              <div className="card-grid deck-builder-v3-grid">
                {pageResults.map((card) => {
                  const owned = ownedQuantity(card.id);
                  const locked = owned <= 0;
                  return (
                  <div className={`builder-card deck-builder-v3-card ${locked ? "collection-locked" : ""}`} key={card.id}>
                    {officialRestrictionSummary(card) && (
                      <span className={`deck-official-restriction ${officialRestrictionSummary(card) === "Proibida" ? "is-banned" : "is-limited"}`}>
                        {officialRestrictionSummary(card)}
                      </span>
                    )}
                    <CardTile card={card} imageVariant="thumbnail" loading="lazy" fetchPriority="low" onClick={() => setDetailsCard(card)} />
                    <div className="deck-v398-card-caption">
                      <strong title={getCardName(card)}>{getCardName(card)}</strong>
                      <span>{card.id} · {card.rarity || "—"} · {pt ? ___bsJa("Custo", "コスト") : ___bsJa("Cost", "コスト")} {card.cost ?? 0}</span>
                    </div>

                    <div className="deck-v421-ownership"><span>{pt ? ___bsJa("Possui", "所有") : ___bsJa("Owned", "所有")}</span><b>{owned}/{MAX_OWNED_COPIES}</b></div>
                    <div className="qty-control deck-builder-v3-qty-control">
                      <button disabled={qty(card.id) <= 0} onClick={() => setQty(card.id, qty(card.id) - 1)}>-</button>
                      <b>{qty(card.id)}</b>
                      <button disabled={locked || qty(card.id) >= owned} onClick={() => setQty(card.id, qty(card.id) + 1)}>+</button>
                    </div>

                    {qty(card.id) > 0 && (
                      <button
                        className={`cover-card-btn ${draft.coverCardId === card.id ? "active" : ""}`}
                        onClick={() => setDraft({ ...draft, coverCardId: card.id })}
                      >
                        ★ {t("deckCover")}
                      </button>
                    )}
                    {locked && <div className="deck-v421-lock"><b>{___bsJa("LOCKED", "ロック済み")}</b><small>{pt ? ___bsJa("Obtenha esta carta na Shop", "このカードをショップで入手") : ___bsJa("Get this card in the Shop", "このカードをショップで入手")}</small></div>}
                  </div>
                  );
                })}
              </div>

              {totalPages > 1 && (
                <nav className="deck-pagination deck-builder-v3-pagination" aria-label={pt ? ___bsJa("Páginas de cartas", "カードページ") : ___bsJa("Card pages", "カードページ")}>
                  <button
                    className="deck-pagination-arrow"
                    disabled={currentPage === 1}
                    onClick={() => goToPage(currentPage - 1)}
                  >
                    ← <span>{pt ? ___bsJa("Anterior", "前の") : ___bsJa("Previous", "前の")}</span>
                  </button>

                  <div className="deck-pagination-pages">
                    {paginationItems.map((item, index) => {
                      if (typeof item === "string") {
                        return <span className="deck-pagination-ellipsis" key={`${item}-${index}`}>…</span>;
                      }
                      return (
                        <button
                          key={item}
                          className={`deck-pagination-page ${item === currentPage ? "active" : ""}`}
                          aria-current={item === currentPage ? "page" : undefined}
                          onClick={() => goToPage(item)}
                        >
                          {item}
                        </button>
                      );
                    })}
                  </div>

                  <button
                    className="deck-pagination-arrow"
                    disabled={currentPage === totalPages}
                    onClick={() => goToPage(currentPage + 1)}
                  >
                    <span>{pt ? ___bsJa("Próxima", "次") : ___bsJa("Next", "次")}</span> →
                  </button>
                </nav>
              )}
            </>
          )}
        </section>
      </div>

      {detailsCard && typeof document !== "undefined" && createPortal(
        <CardDetailsModal
          card={detailsCard}
          initialLanguage={language}
          relatedCards={relatedCards}
          onSelectRelated={setDetailsCard}
          onClose={() => setDetailsCard(null)}
        />,
        document.body
      )}
    </main>
  );
}
