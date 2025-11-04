import type { ChatFeedProps } from "../types/chat";

export default function ChatFeed({
  messages,
  name,
  chatFeedRef,
  chatFeedEndRef,
  handleScroll,
}: ChatFeedProps) {
  return (
    <div ref={chatFeedRef} className="chat__feed" onScroll={handleScroll}>
      {messages.map((msg, index) => {
        const isMyMessage =
          msg.sender.trim().toLowerCase() === name.trim().toLowerCase();
        return (
          <div
            key={index}
            className={`chat__feed__message ${
              isMyMessage ? "my-message" : "other-message"
            }`}
          >
            {/* Namn + tid över meddelandet */}
            <div className="chat__feed__message__top">
              <span className="chat__feed__message__sender">
                {msg.sender}{" "}
                <span className="chat__feed__message__time">• {msg.time}</span>
              </span>
            </div>

            {/* Själva meddelandet i bubblan */}
            <div className="chat__feed__message__content">{msg.message}</div>
          </div>
        );
      })}
      <div ref={chatFeedEndRef} />
    </div>
  );
}
