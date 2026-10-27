import { japaneseText as ___bsJa } from "../../../../localization/displayLanguage.js";
export default function RecentActionPanel({ entries = [] }) {
  return (
    <section className="arena-redesign-utility-section" aria-label={___bsJa("Recent actions", "最近の行動")}>
      <header className="arena-redesign-utility-title">{___bsJa("Recent Action", "最近のアクション")}</header>
      {entries.length ? (
        <ul className="arena-redesign-utility-feed arena-redesign-recent-action-feed">
          {entries.map((entry) => (
            <li key={entry.id}>
              <span>{entry.text}</span>
              {entry.meta ? <small>{entry.meta}</small> : null}
            </li>
          ))}
        </ul>
      ) : (
        <div className="arena-redesign-utility-empty">{___bsJa("No recent action", "最近のアクションはありません")}</div>
      )}
    </section>
  );
}
