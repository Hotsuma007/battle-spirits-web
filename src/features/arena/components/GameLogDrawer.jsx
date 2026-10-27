import { japaneseText as ___bsJa } from "../../../localization/displayLanguage.js";
import { japaneseGameLog, japanesePhase } from "../../../localization/gameLog.js";
import { memo, useMemo } from "react";
import "../../../styles/arena/gameLogDrawerV490.css";

function GameLogDrawerComponent({
  open = false,
  entries = [],
  cardIndex,
  classifyEntry,
  onClose,
  language = "ptBR"
}) {
  const visibleEntries = useMemo(
    () => [...(entries || [])].slice(-80).reverse(),
    [entries]
  );

  return (
    <section
      className={`game-log-drawer arena-overlay-interactive ${open ? "is-open" : ""}`}
      aria-hidden={!open}
      aria-label={language === "en" ? ___bsJa("Game log", "ゲームログ") : ___bsJa("Registro da partida", "ゲームログ")}
      data-game-log-drawer={open ? "open" : "closed"}
    >
      <header className="game-log-drawer-header">
        <div>
          <span>{language === "en" ? ___bsJa("MATCH HISTORY", "試合履歴") : ___bsJa("HISTÓRICO DA PARTIDA", "試合履歴")}</span>
          <strong>{language === "en" ? ___bsJa("Game Log", "ゲームログ") : ___bsJa("Registro", "ゲームログ")}</strong>
        </div>
        <button
          type="button"
          className="game-log-drawer-close"
          onClick={onClose}
          aria-label={language === "en" ? ___bsJa("Close game log", "ゲームログを閉じる") : ___bsJa("Fechar registro", "ゲームログを閉じる")}
          tabIndex={open ? 0 : -1}
        >
          ×
        </button>
      </header>

      <div className="game-log-drawer-list" role="log" aria-live="off">
        {visibleEntries.map((entry) => {
          const kind = classifyEntry?.(entry) || "system";
          return (
            <article className={`game-log-drawer-entry log-${kind}`} key={entry.id}>
              <span>{language === "ja" ? `ターン${entry.turn}・${japanesePhase(entry.phase) || "—"}` : `T${entry.turn} • ${String(entry.phase || "—").toUpperCase()}`}</span>
              <p>{language === "ja" ? japaneseGameLog(entry.text, cardIndex) : entry.text}</p>
            </article>
          );
        })}

        {!visibleEntries.length && (
          <div className="game-log-drawer-empty">
            {language === "en" ? ___bsJa("No match events yet.", "まだ試合イベントはありません。") : ___bsJa("Nenhum evento registrado ainda.", "まだ試合イベントはありません。")}
          </div>
        )}
      </div>
    </section>
  );
}

export default memo(GameLogDrawerComponent);
