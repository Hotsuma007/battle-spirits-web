import { japaneseText as ___bsJa } from "../../../../localization/displayLanguage.js";
export default function EffectResolutionPanel({ effect }) {
  if (!effect?.active) return null;
  return (
    <section className="arena-redesign-effect-resolution" aria-live="polite">
      <span className="arena-redesign-effect-eyebrow">{___bsJa("Effect Resolution", "効果の解決")}</span>
      <strong>{effect.title}</strong>
      <p>{effect.viewerOwnsDecision ? effect.instruction : ___bsJa("Waiting for the other player to resolve an effect.", "他のプレイヤーが効果を解決するのを待っています。")}</p>
    </section>
  );
}
