import { getDisplayCardName as getCardName } from "../../localization/displayCardName.js";
import { localizeShopText } from "../../localization/shopText.js";
import { japaneseText as ___bsJa, isJapaneseDisplay as ___bsJapanese } from "../../localization/displayLanguage.js";
import EternalCinematicBackdrop from "../../components/layout/EternalCinematicBackdrop.jsx";
import PointerTiltSurface from "../../components/layout/PointerTiltSurface.jsx";
import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";

import EmptyState from "../../components/common/EmptyState.jsx";

import {
  getDecks,
  upsertDeck
} from "../../services/platform/storage.js";

import {
  cards,
  cardIndex
} from "../../services/cards/cardRepository.js";

import {

  resolveCardImage,
  resolveCardThumbnail
} from "../../game/cardAdapter.js";

import {
  validateDeck
} from "../../game/state.js";

import {
  PREBUILT_DECKS,
  buildPrebuiltDeck,
  ownsPrebuiltDeckRecipe
} from "../../data/decks/prebuilt-decks.js";

import {
  useLanguage
} from "../../localization/i18n.jsx";
import { loadEconomySnapshot } from "../../services/economy/economyService.js";

import "../../styles/deckbuilder/deckLibrary.css";
import "../../styles/deckbuilder/prebuiltDecks.css";
import "../../styles/pages/eternalInterfaceV350.css";


const COLOR_ACCENTS = {
  red: "#c8c8c8",
  purple: "#b8b8b8",
  green: "#a8a8a8",
  white: "#e2e2e2",
  yellow: "#d4d4d4",
  blue: "#c0c0c0",
  ultimate: "#d4d4d4"
};

const DEFAULT_DECKS_PER_PAGE = 8;
const COMPACT_DECKS_PER_PAGE = 4;

function getDecksPerPageForViewport() {
  if (typeof window === "undefined") {
    return DEFAULT_DECKS_PER_PAGE;
  }

  return window.innerHeight < 960
    ? COMPACT_DECKS_PER_PAGE
    : DEFAULT_DECKS_PER_PAGE;
}


function deckSize(deck) {
  return (
    deck?.cards?.reduce(
      (sum, entry) =>
        sum +
        Number(
          entry.quantity ||
          entry.qty ||
          entry.count ||
          0
        ),
      0
    ) || 0
  );
}


function uniqueCards(deck) {
  return (
    deck?.cards?.filter(
      (entry) =>
        Number(
          entry.quantity ||
          entry.qty ||
          entry.count ||
          0
        ) > 0
    ).length || 0
  );
}


function findDeckCover(deck) {
  if (!deck) {
    return null;
  }

  if (deck.coverCardId) {
    const selected =
      cardIndex.get(
        String(
          deck.coverCardId
        )
      );

    if (selected) {
      return selected;
    }
  }

  for (
    const entry of
      deck.cards || []
  ) {
    const quantity =
      Number(
        entry.quantity ||
        entry.qty ||
        entry.count ||
        0
      );

    if (quantity <= 0) {
      continue;
    }

    const id =
      String(
        entry.cardId ||
        entry.id ||
        ""
      );

    const card =
      cardIndex.get(
        id
      );

    if (card) {
      return card;
    }
  }

  return null;
}


function getDeckAccent(card) {
  const color =
    card?.colors?.[0] ||
    card?.color ||
    card?.symbols?.[0] ||
    "";

  return (
    COLOR_ACCENTS[
      String(
        color
      ).toLowerCase()
    ] ||
    "#c0c0c0"
  );
}


function safeCoverImage(card) {
  if (!card) {
    return "./images/card-back.webp";
  }

  const resolved =
    resolveCardThumbnail(
      card
    );

  return (
    resolved ||
    "./images/card-back.webp"
  );
}


function CoverImage({
  card,
  name,
  className = ""
}) {
  const image =
    safeCoverImage(
      card
    );

  function handleError(
    event
  ) {
    const img =
      event.currentTarget;

    if (img.dataset.fullFallback !== "true" && card) {
      img.dataset.fullFallback = "true";
      img.src = resolveCardImage(card);
      return;
    }

    if (img.dataset.fallback === "true") return;
    img.dataset.fallback = "true";
    img.src = "./images/card-back.webp";
  }

  return (
    <img
      className={className}
      src={image}
      alt={
        name ||
        ___bsJa("Deck cover", "デッキカバー")
      }
      draggable="false"
      loading="lazy"
      decoding="async"
      fetchPriority="low"
      onError={
        handleError
      }
    />
  );
}


function DeckLibraryCard({
  deck,
  onEdit,
  language
}) {
  const cover =
    findDeckCover(
      deck
    );

  const accent =
    getDeckAccent(
      cover
    );

  const validation =
    validateDeck(
      deck.cards || [],
      cardIndex
    );

  const size =
    deckSize(
      deck
    );

  const unique =
    uniqueCards(
      deck
    );

  const coverName =
    cover
      ? getCardName(
          cover
        )
      : (
        language === "ja" ? "表紙なし" : language === "en"
          ? "No cover"
          : "Sem capa"
      );

  const updatedAt =
    deck.updatedAt
      ? new Date(
          deck.updatedAt
        )
      : null;

  const updatedLabel =
    updatedAt &&
    !Number.isNaN(
      updatedAt.getTime()
    )
      ? updatedAt.toLocaleDateString(
          language === "ja" ? "ja-JP" : language === "en"
            ? "en-US"
            : "pt-BR",
          {
            day: "2-digit",
            month: "2-digit",
            year: "numeric"
          }
        )
      : "—";


  return (
    <PointerTiltSurface className="deck-library-v2-tilt" maxTilt={4.2}>
      <article
        className="deck-library-v2-card"
        style={{
          "--deck-accent":
            accent
        }}
      >

      <button
        type="button"
        className="deck-library-v2-open"
        onClick={() =>
          onEdit(
            deck.id
          )
        }
        aria-label={
          language === "en"
            ? (___bsJapanese() ? `${deck.name}を編集` : `Edit ${deck.name}`)
            : (___bsJapanese() ? `${deck.name}を編集` : `Editar ${deck.name}`)
        }
      >

        <div className="deck-library-v2-cover">

          <div className="deck-library-v2-card-image">

            <CoverImage
              card={cover}
              name={coverName}
            />

            <span
              className="deck-library-v2-shine"
              aria-hidden="true"
            />

          </div>


          <span className="deck-library-v2-cover-label">{___bsJa("DECK COVER", "デッキカバー")}</span>

        </div>


        <div className="deck-library-v2-content">

          <header className="deck-library-v2-card-header">

            <div>
              <span className="eyebrow">
                {size}{" "}
                {language === "en"
                  ? ___bsJa("CARDS", "枚")
                  : ___bsJa("CARTAS", "枚")}
              </span>

              <h2>
                {deck.name}
              </h2>
            </div>


            <div
              className={
                `deck-library-v2-status ${
                  validation.ok
                    ? "valid"
                    : "invalid"
                }`
              }
            >
              <i />

              <span>
                {validation.ok
                  ? (
                    language === "en"
                      ? ___bsJa("VALID", "有効")
                      : ___bsJa("VÁLIDO", "有効")
                  )
                  : (
                    language === "en"
                      ? ___bsJa("REVIEW", "レビュー")
                      : ___bsJa("REVISAR", "レビュー")
                  )}
              </span>
            </div>

          </header>


          <p className="deck-library-v2-cover-name">
            <span>
              {language === "en"
                ? ___bsJa("Cover", "カバー")
                : ___bsJa("Capa", "カバー")}
            </span>

            <strong
              title={
                coverName
              }
            >
              {coverName}
            </strong>
          </p>


          <div className="deck-library-v2-meta">

            <div>
              <span>
                {language === "en"
                  ? ___bsJa("UNIQUE", "種類")
                  : ___bsJa("ÚNICAS", "種類")}
              </span>

              <strong>
                {unique}
              </strong>
            </div>


            <div>
              <span>{___bsJa("TOTAL", "合計")}</span>

              <strong>
                {size}
              </strong>
            </div>


            <div>
              <span>
                {language === "en"
                  ? ___bsJa("UPDATED", "更新日")
                  : ___bsJa("ATUALIZADO", "更新日")}
              </span>

              <strong>
                {updatedLabel}
              </strong>
            </div>

          </div>


          <footer className="deck-library-v2-footer">

            <span>
              {language === "en"
                ? ___bsJa("OPEN DECK", "デッキを開く")
                : ___bsJa("ABRIR DECK", "デッキを開く")}
            </span>

            <b aria-hidden="true">
              →
            </b>

          </footer>

        </div>

      </button>

      </article>
    </PointerTiltSurface>
  );
}


function CreateDeckOverlay({
  language,
  builtTemplates,
  onClose,
  onEmpty,
  onCreatePrebuilt
}) {
  const pt =
    language !== "en";

  const [step, setStep] =
    useState("choice");

  const [selectedId, setSelectedId] =
    useState(
      builtTemplates[0]?.template?.id ||
      ""
    );

  const [error, setError] =
    useState("");

  const selected =
    builtTemplates.find(
      (item) =>
        item.template.id ===
        selectedId
    ) ||
    builtTemplates[0] ||
    null;


  function createSelected() {
    setError("");

    if (!selected?.ready) {
      setError(
        language === "ja" ? "コレクションのカードが足りず、このデッキはまだ完成していません。" : pt
          ? "Este deck ainda não está completo na coleção disponível."
          : "This deck is not complete in the available card collection yet."
      );
      return;
    }

    onCreatePrebuilt(
      selected
    );
  }


  return (
    <div
      className="deck-create-overlay"
      role="dialog"
      aria-modal="true"
      aria-label={
        pt
          ? ___bsJa("Criar deck", "デッキを作成する")
          : ___bsJa("Create deck", "デッキを作成する")
      }
    >
      <div
        className={
          `deck-create-shell ${
            step === "prebuilt"
              ? "prebuilt-mode"
              : ""
          }`
        }
      >
        <header className="deck-create-header">
          <div>
            <span className="eyebrow">
              {pt
                ? ___bsJa("NOVO DECK", "新しいデッキ")
                : ___bsJa("NEW DECK", "新しいデッキ")}
            </span>

            <h2>
              {step === "choice"
                ? (
                  pt
                    ? ___bsJa("Como você quer começar?", "どのように始めたいですか?")
                    : ___bsJa("How do you want to start?", "どのように始めたいですか?")
                )
                : (
                  pt
                    ? ___bsJa("Escolha um deck pronto", "構築済みのデッキを選択する")
                    : ___bsJa("Choose a prebuilt deck", "構築済みのデッキを選択する")
                )}
            </h2>

            <p>
              {step === "choice"
                ? (
                  pt
                    ? ___bsJa("Comece do zero ou use uma lista pré-construída como ponto de partida.", "最初から始めるか、事前に作成されたリストを出発点として使用します。")
                    : ___bsJa("Start from scratch or use a prebuilt list as your starting point.", "最初から始めるか、事前に作成されたリストを出発点として使用します。")
                )
                : (
                  pt
                    ? ___bsJa("O deck será copiado para Meus Decks e poderá ser editado normalmente.", "デッキはマイ​​デッキにコピーされ、通常通り編集できるようになります。")
                    : ___bsJa("The deck will be copied to My Decks and can be edited normally.", "デッキはマイ​​デッキにコピーされ、通常通り編集できるようになります。")
                )}
            </p>
          </div>

          <button
            type="button"
            className="ghost deck-create-close"
            onClick={onClose}
            aria-label={
              pt
                ? ___bsJa("Fechar", "閉じる")
                : ___bsJa("Close", "閉じる")
            }
          >
            ×
          </button>
        </header>


        {step === "choice" ? (
          <div className="deck-create-choice-grid">
            <button
              type="button"
              className="deck-create-option empty"
              onClick={onEmpty}
            >
              <span className="deck-create-option-code">{___bsJa("EMPTY DECK", "空のデッキ")}</span>

              <div className="deck-create-option-mark">
                +
              </div>

              <strong>
                {pt
                  ? ___bsJa("Construir do Zero", "ゼロから構築")
                  : ___bsJa("Build from Scratch", "ゼロから構築")}
              </strong>

              <p>
                {pt
                  ? ___bsJa("Abra o Deck Builder com uma lista vazia e monte seu próprio deck.", "空のリストでデッキビルダーを開き、独自のデッキを構築します。")
                  : ___bsJa("Open Deck Builder with an empty list and build your own deck.", "空のリストでデッキビルダーを開き、独自のデッキを構築します。")}
              </p>

              <span className="deck-create-option-action">
                {pt
                  ? ___bsJa("Abrir Deck Builder", "デッキビルダーを開く")
                  : ___bsJa("Open Deck Builder", "デッキビルダーを開く")}
                <b>→</b>
              </span>
            </button>


            <button
              type="button"
              className="deck-create-option prebuilt"
              onClick={() =>
                setStep(
                  "prebuilt"
                )
              }
            >
              <span className="deck-create-option-code">{___bsJa("PREBUILT DECKS", "構築済みデッキ")}</span>

              <div className="deck-create-option-stack" aria-hidden="true">
                <i />
                <i />
                <i />
              </div>

              <strong>
                {pt
                  ? ___bsJa("Deck Pronto", "構築済みデッキ")
                  : ___bsJa("Prebuilt Deck", "構築済みデッキ")}
              </strong>

              <p>
                {pt
                  ? ___bsJa("Experimente decks como SD10, SD17, SD19 e SD20 sem precisar montar a lista manualmente.", "リストを手動で作成せずに、SD10、SD17、SD19、SD20 などのデッキを試してください。")
                  : ___bsJa("Try decks such as SD10, SD17, SD19 and SD20 without building the list manually.", "リストを手動で作成せずに、SD10、SD17、SD19、SD20 などのデッキを試してください。")}
              </p>

              <span className="deck-create-option-action">
                {pt
                  ? ___bsJa("Escolher deck pronto", "構築済みデッキを選択する")
                  : ___bsJa("Choose prebuilt deck", "構築済みデッキを選択する")}
                <b>→</b>
              </span>
            </button>
          </div>
        ) : (
          <div className="prebuilt-browser">
            <aside className="prebuilt-list-panel">
              <button
                type="button"
                className="ghost prebuilt-back-button eternal-menu-action compact"
                onClick={() => {
                  setError("");
                  setStep("choice");
                }}
              >
                {pt
                  ? ___bsJa("Voltar", "戻る")
                  : ___bsJa("Back", "戻る")}
              </button>

              <div className="prebuilt-list-heading">
                <span className="eyebrow">
                  {pt
                    ? ___bsJa("DECKS DISPONÍVEIS", "利用可能なデッキ")
                    : ___bsJa("AVAILABLE DECKS", "利用可能なデッキ")}
                </span>
                <strong>
                  {builtTemplates.length}
                </strong>
              </div>

              <div className="prebuilt-template-list">
                {builtTemplates.map(
                  (item) => {
                    const template =
                      item.template;

                    return (
                      <button
                        key={template.id}
                        type="button"
                        className={
                          `prebuilt-template-button ${
                            selected?.template?.id ===
                            template.id
                              ? "active"
                              : ""
                          }`
                        }
                        style={{
                          "--prebuilt-accent":
                            template.accent
                        }}
                        onClick={() => {
                          setError("");
                          setSelectedId(
                            template.id
                          );
                        }}
                      >
                        <span className="prebuilt-template-thumb">
                          <CoverImage
                            card={item.cover}
                            name={localizeShopText(template.title, language)}
                          />
                        </span>

                        <span className="prebuilt-template-copy">
                          <small>
                            {template.setCode}
                          </small>
                          <strong>
                            {localizeShopText(template.title, language)}
                          </strong>
                          <em>
                            {item.totalCards}{" "}
                            {pt
                              ? ___bsJa("cartas", "枚")
                              : ___bsJa("cards", "枚")}
                          </em>
                        </span>

                        <b aria-hidden="true">
                          →
                        </b>
                      </button>
                    );
                  }
                )}
              </div>
            </aside>


            {selected && (
              <section
                className="prebuilt-detail"
                style={{
                  "--prebuilt-accent":
                    selected.template.accent
                }}
              >
                <div className="prebuilt-detail-hero">
                  <PointerTiltSurface className="prebuilt-detail-cover-tilt" maxTilt={5.4}>
                    <div className="prebuilt-detail-cover">
                      <CoverImage
                        card={selected.cover}
                        name={localizeShopText(selected.template.title, language)}
                      />
                    </div>
                  </PointerTiltSurface>

                  <div className="prebuilt-detail-copy">
                    <span className="prebuilt-set-code">
                      {selected.template.setCode}
                    </span>

                    <h3>
                      {localizeShopText(selected.template.title, language)}
                    </h3>

                    <p>
                      {language === "ja" ? "カードリストを確認した構築済みデッキです。" : pt
                        ? selected.template.subtitlePT
                        : selected.template.subtitleEN}
                    </p>

                    <div className="prebuilt-detail-stats">
                      <div>
                        <span>
                          {pt
                            ? ___bsJa("COR", "色")
                            : ___bsJa("COLOR", "色")}
                        </span>
                        <strong>
                          {pt
                            ? selected.template.colorLabelPT
                            : selected.template.colorLabelEN}
                        </strong>
                      </div>

                      <div>
                        <span>
                          {pt
                            ? ___bsJa("NÍVEL", "レベル")
                            : ___bsJa("LEVEL", "レベル")}
                        </span>
                        <strong>
                          {pt
                            ? selected.template.difficultyPT
                            : selected.template.difficultyEN}
                        </strong>
                      </div>

                      <div>
                        <span>
                          {pt
                            ? ___bsJa("CARTAS", "枚")
                            : ___bsJa("CARDS", "枚")}
                        </span>
                        <strong>
                          {selected.totalCards}
                        </strong>
                      </div>

                      <div>
                        <span>
                          {pt
                            ? ___bsJa("ÚNICAS", "種類")
                            : ___bsJa("UNIQUE", "種類")}
                        </span>
                        <strong>
                          {selected.uniqueCards}
                        </strong>
                      </div>
                    </div>
                  </div>
                </div>


                <div className="prebuilt-card-list-block">
                  <header>
                    <div>
                      <span className="eyebrow">{___bsJa("DECK LIST", "デッキリスト")}</span>
                      <strong>
                        {pt
                          ? ___bsJa("Lista de cartas", "カードリスト")
                          : ___bsJa("Card list", "カードリスト")}
                      </strong>
                    </div>

                    <span
                      className={
                        `prebuilt-ready-badge ${
                          selected.ready
                            ? "ready"
                            : "incomplete"
                        }`
                      }
                    >
                      {selected.ready
                        ? (
                          pt
                            ? ___bsJa("PRONTO", "準備ができて")
                            : ___bsJa("READY", "準備ができて")
                        )
                        : (
                          pt
                            ? ___bsJa("INCOMPLETO", "不完全")
                            : ___bsJa("INCOMPLETE", "不完全")
                        )}
                    </span>
                  </header>

                  <div className="prebuilt-card-list">
                    {selected.entries.map(
                      (entry) => {
                        const card =
                          cardIndex.get(
                            entry.cardId
                          );

                        return (
                          <div
                            key={entry.cardId}
                            className="prebuilt-card-row"
                          >
                            <span className="prebuilt-card-row-id">
                              {entry.cardId}
                            </span>

                            <strong>
                              {card
                                ? getCardName(card)
                                : entry.cardId}
                            </strong>

                            <b>
                              ×{entry.quantity}
                            </b>
                          </div>
                        );
                      }
                    )}
                  </div>
                </div>


                {error && (
                  <div className="prebuilt-error">
                    {error}
                  </div>
                )}


                {!selected.ready && (
                  <div className="prebuilt-warning">
                    {pt
                      ? (___bsJapanese() ? `リストには、作成可能な ${selected.template.expectedSize} カードが含まれている必要があります。` : `A lista precisa ter ${selected.template.expectedSize} cartas disponíveis para ser criada.`)
                      : (___bsJapanese() ? `リストを作成するには、${selected.template.expectedSize} 個の利用可能なカードが必要です。` : `The list needs ${selected.template.expectedSize} available cards before it can be created.`)}
                  </div>
                )}


                <footer className="prebuilt-detail-footer">
                  <p>
                    {pt
                      ? ___bsJa("Uma cópia normal será adicionada à sua biblioteca. Você poderá renomear, editar, trocar a capa e exportar o deck.", "通常のコピーがライブラリに追加されます。デッキの名前変更、編集、カバーの変更、エクスポートが可能です。")
                      : ___bsJa("A normal copy will be added to your library. You can rename, edit, change the cover and export the deck.", "通常のコピーがライブラリに追加されます。デッキの名前変更、編集、カバーの変更、エクスポートが可能です。")}
                  </p>

                  <button
                    type="button"
                    className="primary-btn prebuilt-create-button eternal-menu-action active"
                    disabled={!selected.ready}
                    onClick={createSelected}
                  >
                    <span>
                      {pt
                        ? ___bsJa("Criar este Deck", "このデッキを作成する")
                        : ___bsJa("Create this Deck", "このデッキを作成する")}
                    </span>

                  </button>
                </footer>
              </section>
            )}
          </div>
        )}
      </div>
    </div>
  );
}


export default function Decks({
  onBack,
  onNew,
  onEdit
}) {
  const {
    language
  } =
    useLanguage();

  const decks =
    getDecks();

  const [
    query,
    setQuery
  ] =
    useState("");

  const [
    createOpen,
    setCreateOpen
  ] =
    useState(false);

  const [
    libraryPage,
    setLibraryPage
  ] = useState(1);

  const [
    decksPerPage,
    setDecksPerPage
  ] = useState(getDecksPerPageForViewport);

  const [ownedRecipes, setOwnedRecipes] = useState([]);

  useEffect(() => {
    let active = true;
    const refreshRecipes = () => loadEconomySnapshot().then((snapshot) => {
      if (active) setOwnedRecipes(Array.isArray(snapshot.recipes) ? snapshot.recipes : []);
    });
    refreshRecipes();
    window.addEventListener("bs:economy-changed", refreshRecipes);
    return () => { active = false; window.removeEventListener("bs:economy-changed", refreshRecipes); };
  }, []);


  const builtTemplates =
    useMemo(
      () =>
        PREBUILT_DECKS
          .filter((template) => ownsPrebuiltDeckRecipe(template, ownedRecipes))
          .map(
            (template) => ({
              template,
              ...buildPrebuiltDeck(
                template,
                cards,
                cardIndex
              )
            })
          ),
      [ownedRecipes]
    );


  const filteredDecks =
    useMemo(
      () => {
        const q =
          query
            .trim()
            .toLocaleLowerCase(
              language === "en"
                ? "en-US"
                : "pt-BR"
            );

        if (!q) {
          return decks;
        }

        return decks.filter(
          (deck) => {
            const cover =
              findDeckCover(
                deck
              );

            const haystack =
              [
                deck.name,
                cover
                  ? getCardName(
                      cover
                    )
                  : ""
              ]
                .join(" ")
                .toLocaleLowerCase(
                  language === "en"
                    ? "en-US"
                    : "pt-BR"
                );

            return haystack.includes(
              q
            );
          }
        );
      },
      [
        decks,
        query,
        language
      ]
    );


  const libraryPages = Math.max(1, Math.ceil(filteredDecks.length / decksPerPage));
  const pagedDecks = filteredDecks.slice((libraryPage - 1) * decksPerPage, libraryPage * decksPerPage);

  useEffect(() => {
    setLibraryPage(1);
  }, [query, language, decksPerPage]);

  useEffect(() => {
    if (libraryPage > libraryPages) setLibraryPage(libraryPages);
  }, [libraryPage, libraryPages]);

  useEffect(() => {
    if (typeof window === "undefined") return undefined;

    function syncDeckPageSize() {
      setDecksPerPage(getDecksPerPageForViewport());
    }

    syncDeckPageSize();
    window.addEventListener("resize", syncDeckPageSize);

    return () => {
      window.removeEventListener("resize", syncDeckPageSize);
    };
  }, []);


  const stats =
    useMemo(
      () => {
        let totalCards =
          0;

        let validDecks =
          0;

        for (
          const deck of decks
        ) {
          totalCards +=
            deckSize(
              deck
            );

          if (
            validateDeck(
              deck.cards || [],
              cardIndex
            ).ok
          ) {
            validDecks +=
              1;
          }
        }

        return {
          totalCards,
          validDecks
        };
      },
      [
        decks
      ]
    );


  const copy =
    language === "ja"
      ? {
          eyebrow: "デッキ", title: "マイデッキ", subtitle: "保存したデッキを選んで編集できます。",
          newDeck: "新しいデッキ", search: "デッキ名や表紙カードで検索", decks: "デッキ", valid: "使用可能",
          cards: "カード", library: "デッキ一覧", result: "件のデッキ", none: "デッキがありません",
          noneBody: "新しいデッキを作るか、構築済みデッキから始めてください。", noSearch: "検索条件に合うデッキはありません。", clear: "検索をクリア"
        }
      : language === "en"
      ? {
          eyebrow:
            "DECKS",

          title:
            "My Decks",

          subtitle:
            "Manage your saved Eternal decks and choose one to edit.",

          newDeck:
            "New Deck",

          search:
            "Search deck or cover card...",

          decks:
            "Decks",

          valid:
            "Valid",

          cards:
            "Cards",

          library:
            "LIBRARY",

          result:
            "saved decks",

          none:
            "No decks found",

          noneBody:
            "Create a new deck or start with a prebuilt deck.",

          noSearch:
            "No deck matches your search.",

          clear:
            "Clear search"
        }
      : {
          eyebrow:
            "DECKS",

          title:
            "Meus Decks",

          subtitle:
            "Gerencie seus decks salvos do formato Eternal e escolha um para editar.",

          newDeck:
            "Novo Deck",

          search:
            "Buscar deck ou carta de capa...",

          decks:
            "Decks",

          valid:
            "Válidos",

          cards:
            "Cartas",

          library:
            "BIBLIOTECA",

          result:
            "decks salvos",

          none:
            "Nenhum deck salvo",

          noneBody:
            "Crie um deck do zero ou comece com um deck pré-construído.",

          noSearch:
            "Nenhum deck corresponde à sua busca.",

          clear:
            "Limpar busca"
        };


  function createPrebuilt(
    built
  ) {
    const template =
      built.template;

    if (!built.ready) {
      return;
    }

    const id =
      upsertDeck({
        id: null,
        name:
          `${template.setCode} · ${localizeShopText(template.title, language)}`,
        cards:
          built.entries.map(
            (entry) => ({
              ...entry
            })
          ),
        coverCardId:
          built.cover?.id ||
          template.coverCardId ||
          built.entries[0]?.cardId ||
          null,
        createdFromPrebuilt:
          true,
        prebuiltTemplateId:
          template.id,
        prebuiltSetCode:
          template.setCode
      });

    setCreateOpen(
      false
    );

    onEdit(
      id
    );
  }


  function startEmptyDeck() {
    setCreateOpen(
      false
    );

    onNew();
  }


  return (
    <main className="standard-page deck-library-v2-page eternal-page eternal-decks-page">
      <EternalCinematicBackdrop />

      <header className="deck-library-v2-topbar">

        <button
          className="ghost deck-library-v2-back eternal-menu-action"
          onClick={
            onBack
          }
        >
          {language === "en"
            ? ___bsJa("Back", "戻る")
            : ___bsJa("Voltar", "戻る")}
        </button>


        <div className="deck-library-v2-title">

          <span className="eyebrow">
            {copy.eyebrow}
          </span>

          <h1>
            {copy.title}
          </h1>

          <p>
            {copy.subtitle}
          </p>

        </div>


        <button
          className="primary-btn deck-library-v2-new eternal-menu-action active"
          onClick={() =>
            setCreateOpen(
              true
            )
          }
        >
          <span>
            {copy.newDeck}
          </span>


        </button>

      </header>


      <section className="deck-library-v2-summary">

        <div className="deck-library-v2-stat">
          <span>
            {copy.decks}
          </span>

          <strong>
            {decks.length}
          </strong>
        </div>


        <div className="deck-library-v2-stat valid">
          <span>
            {copy.valid}
          </span>

          <strong>
            {stats.validDecks}
          </strong>
        </div>


        <div className="deck-library-v2-stat">
          <span>
            {copy.cards}
          </span>

          <strong>
            {stats.totalCards}
          </strong>
        </div>


        <label className="deck-library-v2-search">

          <span aria-hidden="true">
            ⌕
          </span>

          <input
            value={
              query
            }
            placeholder={
              copy.search
            }
            onChange={(
              event
            ) =>
              setQuery(
                event.target.value
              )
            }
          />

          {query && (
            <button
              type="button"
              title={
                copy.clear
              }
              aria-label={
                copy.clear
              }
              onClick={() =>
                setQuery("")
              }
            >
              ×
            </button>
          )}

        </label>

      </section>


      <section className="deck-library-v2-library">

        <header className="deck-library-v2-library-heading">

          <div>
            <span className="eyebrow">
              {copy.library}
            </span>

            <h2>
              {filteredDecks.length}{" "}
              {copy.result}
            </h2>
          </div>


          <span className="deck-library-v2-line" />

        </header>


        {!decks.length ? (
          <div className="deck-library-v2-empty">

            <EmptyState
              title={
                copy.none
              }
            >
              {copy.noneBody}
            </EmptyState>


            <button
              className="primary-btn"
              onClick={() =>
                setCreateOpen(
                  true
                )
              }
            >
              {copy.newDeck}
            </button>

          </div>
        ) : !filteredDecks.length ? (
          <div className="deck-library-v2-no-results">

            <span>
              ⌕
            </span>

            <strong>
              {copy.noSearch}
            </strong>

            <button
              className="ghost"
              onClick={() =>
                setQuery("")
              }
            >
              {copy.clear}
            </button>

          </div>
        ) : (
          <div className="deck-library-v2-grid">

            {pagedDecks.map(
              (deck) => (
                <DeckLibraryCard
                  key={
                    deck.id
                  }
                  deck={
                    deck
                  }
                  onEdit={
                    onEdit
                  }
                  language={
                    language
                  }
                />
              )
            )}


          </div>
        )}

        {filteredDecks.length > decksPerPage && (
          <nav className="deck-library-v2-pagination" aria-label={language === "en" ? ___bsJa("Deck pages", "デッキページ") : ___bsJa("Páginas de decks", "デッキページ")}>
            <button disabled={libraryPage === 1} onClick={() => setLibraryPage((page) => Math.max(1, page - 1))}>
              {language === "en" ? ___bsJa("Previous", "前の") : ___bsJa("Anterior", "前の")}
            </button>
            {Array.from({ length: libraryPages }, (_, index) => index + 1).map((page) => (
              <button
                key={page}
                className={page === libraryPage ? "active" : ""}
                aria-current={page === libraryPage ? "page" : undefined}
                onClick={() => setLibraryPage(page)}
              >
                {page}
              </button>
            ))}
            <button disabled={libraryPage === libraryPages} onClick={() => setLibraryPage((page) => Math.min(libraryPages, page + 1))}>
              {language === "en" ? ___bsJa("Next", "次") : ___bsJa("Próxima", "次")}
            </button>
          </nav>
        )}

      </section>


      {createOpen && typeof document !== "undefined" && createPortal(
        <CreateDeckOverlay
          language={language}
          builtTemplates={builtTemplates}
          onClose={() =>
            setCreateOpen(
              false
            )
          }
          onEmpty={
            startEmptyDeck
          }
          onCreatePrebuilt={
            createPrebuilt
          }
        />,
        document.body
      )}

    </main>
  );
}
