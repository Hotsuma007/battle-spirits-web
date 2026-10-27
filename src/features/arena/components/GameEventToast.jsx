import { useEffect, useRef, useState } from "react";
import { japaneseGameLog } from "../../../localization/gameLog.js";
import "../../../styles/arena/gameEventToastV490.css";

const DISPLAY_MS = 2100;
const MAX_QUEUE = 4;
const VISIBLE_KINDS = new Set(["battle", "timing", "life", "removal", "play"]);

function nextUnseenEntries(entries, lastSeenId) {
  if (!Array.isArray(entries) || !entries.length) return [];
  if (!lastSeenId) return [];
  const index = entries.findIndex((entry) => entry?.id === lastSeenId);
  if (index < 0) return [entries.at(-1)].filter(Boolean);
  return entries.slice(index + 1);
}

export default function GameEventToast({ entries = [], cardIndex, classifyEntry, language = "ptBR" }) {
  const lastSeenIdRef = useRef(null);
  const timerRef = useRef(null);
  const [queue, setQueue] = useState([]);
  const [active, setActive] = useState(null);

  useEffect(() => {
    const last = entries?.at?.(-1);
    if (!last?.id) return;

    if (!lastSeenIdRef.current) {
      lastSeenIdRef.current = last.id;
      return;
    }

    const unseen = nextUnseenEntries(entries, lastSeenIdRef.current)
      .map((entry) => ({ ...entry, visualKind: classifyEntry?.(entry) || "system" }))
      .filter((entry) => VISIBLE_KINDS.has(entry.visualKind));

    lastSeenIdRef.current = last.id;
    if (!unseen.length) return;
    setQueue((current) => [...current, ...unseen].slice(-MAX_QUEUE));
  }, [entries, classifyEntry]);

  useEffect(() => {
    if (active || !queue.length) return undefined;
    const [next, ...rest] = queue;
    setQueue(rest);
    setActive(next);
    return undefined;
  }, [queue, active]);

  useEffect(() => {
    if (!active || typeof window === "undefined") return undefined;
    timerRef.current = window.setTimeout(() => {
      setActive(null);
      timerRef.current = null;
    }, DISPLAY_MS);
    return () => {
      if (timerRef.current) window.clearTimeout(timerRef.current);
      timerRef.current = null;
    };
  }, [active]);

  if (!active) return null;

  const label = language === "ja" ? ({ battle: "バトル", timing: "タイミング", life: "ライフ", removal: "カード移動", play: "カード使用" }[active.visualKind] || "イベント") : {
    battle: language === "en" ? "BATTLE" : "BATALHA",
    timing: "TIMING",
    life: "LIFE",
    removal: language === "en" ? "REMOVAL" : "REMOÇÃO",
    play: language === "en" ? "PLAY" : "JOGADA"
  }[active.visualKind] || "EVENT";

  return (
    <div
      className={`game-event-toast event-${active.visualKind}`}
      role="status"
      aria-live="polite"
      data-game-event-toast={active.visualKind}
    >
      <i aria-hidden="true" />
      <div>
        <span>{label}</span>
        <strong>{language === "ja" ? japaneseGameLog(active.text, cardIndex) : active.text}</strong>
      </div>
    </div>
  );
}
