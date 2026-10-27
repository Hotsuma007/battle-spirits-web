import { japaneseText as ___bsJa } from "../../../../localization/displayLanguage.js";
export default function GameLogPanel({ entries = [] }) {
  return (
    <section className="arena-redesign-utility-section arena-redesign-game-log" aria-label={___bsJa("Game log", "ゲームログ")}>
      <header className="arena-redesign-utility-title">{___bsJa("Game Log", "ゲームログ")}</header>
      {entries.length ? (
        <ol className="arena-redesign-utility-feed">
          {entries.map((entry) => (
            <li key={entry.id}>
              <span>{entry.text}</span>
              {entry.meta ? <small>{entry.meta}</small> : null}
            </li>
          ))}
        </ol>
      ) : (
        <div className="arena-redesign-utility-empty">{___bsJa("No log entries", "ログエントリがありません")}</div>
      )}
    </section>
  );
}
