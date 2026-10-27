import { japaneseText as ___bsJa, isJapaneseDisplay as ___bsJapanese } from "../../../../localization/displayLanguage.js";
import ArenaVisualTriggerCounterPrompt from "./ArenaVisualTriggerCounterPrompt.jsx";
import ArenaVisualTriggerReveal from "./ArenaVisualTriggerReveal.jsx";

export default function ArenaVisualUltimateTriggerPrompt({ trigger, onActionRequest }) {
  if (!trigger) return null;

  return (
    <section className={`arena-visual-ultimate-trigger is-${String(trigger.resultLabel || "guard").toLowerCase()}${trigger.kind === "xu" ? " is-xu" : ""}`}>
      <header>
        <div><span>{trigger.kind === "xu" ? ___bsJa("XU Trigger", "XUトリガー") : ___bsJa("Ultimate Trigger", "アルティメットトリガー")}</span><h2>{trigger.resultLabel}</h2></div>
        <b>{trigger.statusLabel}</b>
      </header>

      <ArenaVisualTriggerReveal trigger={trigger} />

      {trigger.criticalHit?.eligible && !trigger.countered ? (
        <div className="arena-visual-trigger-critical">
          <span>{___bsJa("Critical Hit", "クリティカルヒット")}</span>
          <strong>{___bsJa("Critical Hit condition met", "クリティカルヒット条件を満たした")}</strong>
          {trigger.criticalHit.text ? <p>{trigger.criticalHit.text}</p> : null}
        </div>
      ) : null}

      <ArenaVisualTriggerCounterPrompt trigger={trigger} onActionRequest={onActionRequest} />

      {trigger.effectText && trigger.status !== "counterWindow" ? (
        <div className="arena-visual-trigger-effect">
          <span>{trigger.kind === "xu" ? ___bsJa("XU Hit Effect", "XUヒットエフェクト") : trigger.hit ? ___bsJa("Hit Effect", "ヒットエフェクト") : ___bsJa("Result", "結果")}</span>
          <p>{trigger.effectText}</p>
        </div>
      ) : null}

      {trigger.status !== "counterWindow" ? (
        <footer>
          {trigger.waiting ? (
            <span>{___bsJa("Waiting for the Trigger controller to continue.", "トリガー コントローラーの続行を待機しています。")}</span>
          ) : (
            <button
              type="button"
              onClick={() => onActionRequest?.({
                id: "resolve-ultimate-trigger",
                type: "RESOLVE_ULTIMATE_TRIGGER",
                actorId: trigger.controllerPlayerId
              })}
            >
              {trigger.countered ? ___bsJa("Continue After Trigger Counter", "トリガーカウンター後に続行") : trigger.hit ? (___bsJapanese() ? `${trigger.kind === "xu" ? "XU HIT" : "HIT"} を解決して続行する` : `Resolve ${trigger.kind === "xu" ? "XU HIT" : "HIT"} and Continue`) : ___bsJa("Continue", "続ける")}
            </button>
          )}
        </footer>
      ) : null}
    </section>
  );
}
