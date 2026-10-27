import { japaneseText as ___bsJa } from "../../../../localization/displayLanguage.js";
export default function ArenaChatPanel({ messages = [], enabled = true }) {
  return (
    <section className="arena-redesign-utility-section arena-redesign-chat" aria-label={___bsJa("Arena chat", "アリーナチャット")}>
      <header className="arena-redesign-utility-title">{___bsJa("Chat", "チャット")}</header>
      {!enabled ? (
        <div className="arena-redesign-utility-empty">{___bsJa("Chat unavailable", "チャットは利用できません")}</div>
      ) : messages.length ? (
        <div className="arena-redesign-chat-messages">
          {messages.map((message) => (
            <article key={message.id} className={message.own ? "is-own" : ""}>
              <strong>{message.author}</strong>
              <span>{message.text}</span>
            </article>
          ))}
        </div>
      ) : (
        <div className="arena-redesign-utility-empty">{___bsJa("No messages", "メッセージはありません")}</div>
      )}
    </section>
  );
}
