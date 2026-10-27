import { japaneseText as ___bsJa, isJapaneseDisplay as ___bsJapanese } from "../../../../localization/displayLanguage.js";
export default function ArenaVisualReconnectOverlay({ online }) {
  if (!online?.enabled) return null;

  if (online.viewerNeedsReconnect) {
    return (
      <div className="arena-visual-reconnect-overlay" role="alert">
        <section>
          <span>{___bsJa("Connection", "繋がり")}</span>
          <strong>{online.viewerConnectionState === "reconnecting" ? ___bsJa("Reconnecting…", "再接続中…") : ___bsJa("Connection lost", "接続が失われました")}</strong>
          <p>{___bsJa("The match state remains server-authoritative while the client attempts to resume the session.", "クライアントがセッションを再開しようとしている間、一致状態はサーバー権限のままです。")}</p>
          {Number.isFinite(online.viewerReconnectRemainingSeconds) ? <b>{online.viewerReconnectRemainingSeconds}s</b> : null}
        </section>
      </div>
    );
  }

  if (online.opponentNeedsReconnect) {
    return (
      <div className="arena-visual-opponent-reconnect" role="status">
        <i />
        <span>
          <strong>{___bsJa("Opponent reconnecting", "相手が再接続中")}</strong>
          <small>{Number.isFinite(online.opponentReconnectRemainingSeconds) ? (___bsJapanese() ? `残り ${online.opponentReconnectRemainingSeconds} 件` : `${online.opponentReconnectRemainingSeconds}s remaining`) : ___bsJa("Waiting for the opponent to return", "相手の帰りを待つ")}</small>
        </span>
      </div>
    );
  }

  return null;
}
