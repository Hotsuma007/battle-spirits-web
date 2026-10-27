import { japaneseText as ___bsJa } from "../../../../localization/displayLanguage.js";
export default function PrimaryActionPanel({ actions = [], onActionRequest }) {
  return (
    <section className="arena-redesign-utility-section" aria-label={___bsJa("Contextual actions", "コンテキストに応じたアクション")}>
      <header className="arena-redesign-utility-title">{___bsJa("Actions", "アクション")}</header>
      <div className="arena-redesign-primary-actions" data-action-count={actions.length}>
        {actions.length ? actions.map((action) => (
          <button
            key={action.id || action.type}
            type="button"
            onClick={() => onActionRequest?.(action)}
            data-action-type={action.type}
          >
            {action.label}
          </button>
        )) : (
          <div className="arena-redesign-utility-empty">{___bsJa("No global action available", "使用可能なグローバル アクションはありません")}</div>
        )}
      </div>
    </section>
  );
}
