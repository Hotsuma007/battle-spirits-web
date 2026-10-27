import { useLanguage } from "../../../../localization/i18n.jsx";

const JA_ZONES = { Life: "ライフ", Burst: "バースト", Reserve: "リザーブ", Deck: "デッキ", Trash: "トラッシュ", "Core Trash": "コアトラッシュ", Hand: "手札" };

export default function ArenaVisualZone({
  name,
  count,
  className = "",
  children,
  compact = false,
  hidden = false,
  ...props
}) {
  const { language } = useLanguage();
  const label = language === "ja" ? (JA_ZONES[name] || name) : name;
  if (hidden) return null;

  return (
    <section
      {...props}
      className={`arena-visual-zone${compact ? " is-compact" : ""}${className ? ` ${className}` : ""}`}
      aria-label={label}
      data-zone={name.toLowerCase().replaceAll(" ", "-")}
    >
      <header className="arena-visual-zone-label">
        <span>{label}</span>
        {Number.isFinite(count) ? <strong>{count}</strong> : null}
      </header>
      <div className="arena-visual-zone-content">{children}</div>
    </section>
  );
}
