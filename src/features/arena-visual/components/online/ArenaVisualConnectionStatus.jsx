import { japaneseText as ___bsJa } from "../../../../localization/displayLanguage.js";
export default function ArenaVisualConnectionStatus({ online }) {
  if (!online?.enabled) return null;
  return (
    <div className={`arena-visual-connection-status is-${online.viewerConnectionState || "connected"}`}>
      <i />
      <span>{online.viewerConnectionLabel || ___bsJa("Connected", "接続済み")}</span>
      {online.serverAuthoritative ? <b>{___bsJa("Server", "サーバ")}</b> : null}
    </div>
  );
}
