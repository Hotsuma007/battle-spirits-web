import { japaneseText as ___bsJa, isJapaneseDisplay as ___bsJapanese } from "../../../localization/displayLanguage.js";
import { useEffect, useRef, useState } from "react";
import "../../../styles/arena/burstPresentationV490.css";

const REVEAL_MS = 1450;

function copyBurstState(players = {}) {
  return new Map(
    Object.entries(players || {}).map(([playerId, player]) => [playerId, player?.burst || null])
  );
}

export default function BurstPresentation({
  players = {},
  actionLog = [],
  burstOpportunity = null,
  getCardPresentation,
  language = "ptBR"
}) {
  const previousBurstsRef = useRef(copyBurstState(players));
  const previousActionSequenceRef = useRef(actionLog?.at?.(-1)?.sequence || null);
  const timerRef = useRef(null);
  const [reveal, setReveal] = useState(null);

  useEffect(() => {
    const lastAction = actionLog?.at?.(-1) || null;
    const previousSequence = previousActionSequenceRef.current;
    const previousBursts = previousBurstsRef.current;

    if (
      lastAction?.sequence &&
      previousSequence != null &&
      lastAction.sequence !== previousSequence &&
      lastAction.type === "ACTIVATE_BURST"
    ) {
      const physical = previousBursts.get(lastAction.actorId);
      const player = players?.[lastAction.actorId];
      const presentation = physical ? getCardPresentation?.(physical) : null;

      setReveal({
        id: `${lastAction.sequence}:${lastAction.actorId}`,
        playerName: player?.name || (language === "ja" ? "プレイヤー" : language === "en" ? "Player" : "Jogador"),
        ...presentation
      });
    }

    previousActionSequenceRef.current = lastAction?.sequence || previousSequence;
    previousBurstsRef.current = copyBurstState(players);
  }, [players, actionLog, getCardPresentation, language]);

  useEffect(() => {
    if (!reveal || typeof window === "undefined") return undefined;
    if (timerRef.current) window.clearTimeout(timerRef.current);
    timerRef.current = window.setTimeout(() => {
      setReveal(null);
      timerRef.current = null;
    }, REVEAL_MS);
    return () => {
      if (timerRef.current) window.clearTimeout(timerRef.current);
      timerRef.current = null;
    };
  }, [reveal]);

  const opportunityPlayer = burstOpportunity?.playerId ? players?.[burstOpportunity.playerId] : null;

  return (
    <>
      {burstOpportunity && opportunityPlayer && !reveal && (
        <div className="burst-opportunity-cue" role="status" aria-live="polite">
          <span>{___bsJa("BURST", "バースト")}</span>
          <strong>
            {language === "en"
              ? (___bsJapanese() ? `${opportunityPlayer.name} にはバースト ウィンドウがあります` : `${opportunityPlayer.name} has a Burst window`)
              : (___bsJapanese() ? `${opportunityPlayer.name} にはバースト ウィンドウがあります` : `${opportunityPlayer.name} possui uma janela de Burst`)}
          </strong>
          <small>{language === "en" ? ___bsJa("Activate or pass.", "アクティブ化またはパスします。") : ___bsJa("Ative ou passe a janela.", "アクティブ化またはパスします。")}</small>
        </div>
      )}

      {reveal && (
        <div className="burst-presentation" role="status" aria-live="assertive">
          <div className="burst-presentation-backdrop" />
          <div className="burst-presentation-card">
            <span className="burst-presentation-eyebrow">{___bsJa("BURST ACTIVATED", "バースト発動")}</span>
            {reveal.image ? <img src={reveal.image} alt="" /> : <div className="burst-presentation-placeholder" />}
            <div>
              <strong>{reveal.name || ___bsJa("Burst", "バースト")}</strong>
              <small>{reveal.playerName}</small>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
