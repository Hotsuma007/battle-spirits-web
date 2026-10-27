import { japaneseText as ___bsJa } from "../../../localization/displayLanguage.js";
import { useEffect, useMemo, useState } from "react";

function initialRemainingMs(readyCheck) {
  const serverRemaining = Number(readyCheck?.remainingMs);
  if (Number.isFinite(serverRemaining)) return Math.max(0, serverRemaining);

  // Backward-compatible fallback for older servers. The button itself never
  // trusts this local clock calculation for authority.
  const deadline = Number(readyCheck?.deadline || 0);
  return deadline > 0 ? Math.max(0, deadline - Date.now()) : 0;
}

export default function ReadyCheck({ readyCheck, onReady, onCancel, submitting = false }) {
  const [now, setNow] = useState(Date.now());
  const [clockAnchor, setClockAnchor] = useState(() => ({
    receivedAt: Date.now(),
    remainingMs: initialRemainingMs(readyCheck)
  }));

  useEffect(() => {
    setClockAnchor({
      receivedAt: Date.now(),
      remainingMs: initialRemainingMs(readyCheck)
    });
  }, [readyCheck?.readyCheckId, readyCheck?.remainingMs, readyCheck?.deadline]);

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 250);
    return () => clearInterval(timer);
  }, []);

  const seconds = useMemo(() => {
    const elapsed = Math.max(0, now - clockAnchor.receivedAt);
    return Math.max(0, Math.ceil((clockAnchor.remainingMs - elapsed) / 1000));
  }, [clockAnchor, now]);

  const playerReady = Boolean(readyCheck?.playerReady);
  const opponentReady = Boolean(readyCheck?.opponentReady);

  return (
    <div className="online-ready-check" role="dialog" aria-labelledby="online-ready-check-title">
      <div className="online-ready-check__header">
        <span>{___bsJa("PARTIDA ENCONTRADA", "一致が見つかりました")}</span>
        <strong id="online-ready-check-title">{___bsJa("Confirmar partida", "ゲームを確認する")}</strong>
        <small>{seconds}s</small>
      </div>

      <div className="online-ready-check__players">
        <div className={playerReady ? "is-ready" : ""}>
          <span>{___bsJa("VOCÊ", "自分")}</span>
          <strong>{playerReady ? ___bsJa("PRONTO", "プロント") : ___bsJa("AGUARDANDO", "待っている")}</strong>
        </div>
        <div className={opponentReady ? "is-ready" : ""}>
          <span>{___bsJa("OPONENTE", "相手")}</span>
          <strong>{opponentReady ? ___bsJa("PRONTO", "プロント") : ___bsJa("AGUARDANDO", "待っている")}</strong>
        </div>
      </div>

      <p>{___bsJa("Os dois jogadores precisam confirmar antes da partida começar.", "試合開始前に両プレイヤーが確認する必要があります。")}</p>

      <div className="online-ready-check__actions">
        <button
          type="button"
          className="primary"
          disabled={playerReady || submitting}
          onClick={onReady}
        >
          {playerReady ? ___bsJa("Confirmado", "確認済み") : submitting ? ___bsJa("Confirmando...", "確認中...") : ___bsJa("Estou pronto", "準備できました")}
        </button>
        <button type="button" disabled={submitting} onClick={onCancel}>{___bsJa("Cancelar", "キャンセル")}</button>
      </div>
    </div>
  );
}
