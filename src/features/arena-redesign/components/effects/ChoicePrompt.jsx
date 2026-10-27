import { japaneseText as ___bsJa } from "../../../../localization/displayLanguage.js";
export default function ChoicePrompt({ choice, onActionRequest }) {
  if (!choice?.active) return null;

  return (
    <section className="arena-redesign-choice-prompt" aria-label={___bsJa("Effect Choice", "エフェクトの選択")}>
      <strong>{choice.title}</strong>
      <span>{choice.instruction}</span>
      {choice.totalCores != null && <small>{choice.totalCores}{___bsJa(" Core", " コア")}{choice.totalCores === 1 ? "" : "s"}{___bsJa(" to distribute", " 配布する")}</small>}
      <div className="arena-redesign-choice-actions">
        {choice.actions.map((action) => (
          <button key={action.id || `${action.type}-${action.label}`} type="button" onClick={() => onActionRequest?.(action, { source: "effect-decision" })}>
            {action.label}
          </button>
        ))}
      </div>
    </section>
  );
}
