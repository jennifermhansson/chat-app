import type { ChatFormProps } from "../types/chat";

export default function ChatForm({
  name,
  setName,
  input,
  setInput,
  sendMessage,
}: ChatFormProps) {
  return (
    <form className="chat__form" onSubmit={(e) => e.preventDefault()}>
      <input
        className="chat__form__name-input"
        type="text"
        placeholder="Ditt namn"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <input
        className="chat__form__message-input"
        type="text"
        placeholder="Skriv ett meddelande..."
        value={input}
        onChange={(e) => setInput(e.target.value)}
      />
      <button onClick={sendMessage}>Skicka</button>
    </form>
  );
}
