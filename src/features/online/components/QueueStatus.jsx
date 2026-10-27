import { japaneseText as ___bsJa } from "../../../localization/displayLanguage.js";
export default function QueueStatus({ message = "Procurando adversário...", onCancel }) {
  return (
    <div className="online-queue-status" role="status" aria-live="polite">
      <div className="online-queue-status__pulse" aria-hidden="true" />
      <div>
        <span className="online-queue-status__eyebrow">{___bsJa("CASUAL MATCHMAKING", "カジュアルマッチメイキング")}</span>
        <strong>{message}</strong>
        <small>{___bsJa("A fila é controlada pelo servidor.", "キューはサーバーによって制御されます。")}</small>
      </div>
      {onCancel && (
        <button type="button" onClick={onCancel}>{___bsJa("Cancelar busca", "検索をキャンセルする")}</button>
      )}
    </div>
  );
}
