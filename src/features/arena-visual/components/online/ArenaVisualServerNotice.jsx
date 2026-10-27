import { japaneseText as ___bsJa } from "../../../../localization/displayLanguage.js";
export default function ArenaVisualServerNotice({ online }) {
  const message = online?.error || online?.notice;
  if (!message) return null;
  return (
    <div className={`arena-visual-server-notice${online.error ? " is-error" : ""}`} role={online.error ? "alert" : "status"}>
      <span>{online.error ? ___bsJa("Server Error", "サーバーエラー") : ___bsJa("Server Notice", "サーバー通知")}</span>
      <strong>{message}</strong>
    </div>
  );
}
