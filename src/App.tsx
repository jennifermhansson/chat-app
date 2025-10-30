import { useEffect, useState, useRef } from "react";
import "./App.css";
import { io } from "socket.io-client";

// Anslut till servern
const socket = io("ws://10.100.2.139:3001");

type ChatMessage = { sender: string; message: string };

function App() {
  const [connected, setConnected] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [name, setName] = useState("");
  const [input, setInput] = useState("");
  const [isNearBottom, setIsNearBottom] = useState(true);
  const chatFeedRef = useRef<null | HTMLDivElement>(null);
  const chatFeedEndRef = useRef<null | HTMLDivElement>(null);
  const connectionStatus = connected ? "✅ Connected" : "❌ Disconnected";

  const handleScroll = () => {
    const chatFeed = chatFeedRef.current;
    if (!chatFeed) return;

    const distanceFromBottom =
      chatFeed.scrollHeight - chatFeed.scrollTop - chatFeed.clientHeight;
    setIsNearBottom(distanceFromBottom < 50);
  };

  useEffect(() => {
    if (isNearBottom) {
      chatFeedEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isNearBottom]);

  useEffect(() => {
    socket.on("connect", () => setConnected(true));
    socket.on("disconnect", () => setConnected(false));
    socket.on("chat_room", (data) => {
      try {
        const parsed = JSON.parse(data) as ChatMessage;
        setMessages((prev) => [...prev, parsed]);
      } catch {
        console.error("Failed to parse message", data);
      }
    });

    return () => {
      socket.off("connect");
      socket.off("disconnect");
      socket.off("chat_room");
    };
  }, []);

  const sendMessage = () => {
    if (!input.trim() || !name.trim()) return;

    const msg: ChatMessage = {
      sender: name,
      message: input,
    };

    socket.emit("chat_room", JSON.stringify(msg));
    setMessages((prev) => [...prev, msg]);
    setInput("");
  };

  return (
    <div className="chat-container">
      <div className="chat-header">
        <h2>Realtime Chat</h2>
        <p>{connectionStatus}</p>
      </div>
      <div ref={chatFeedRef} className="chat-feed" onScroll={handleScroll}>
        {messages.map((msg, index) => (
          <div key={index} className="message-container">
            <span className="message-sender">{msg.sender}</span>
            <span className="message-text">{msg.message}</span>
          </div>
        ))}
        <div ref={chatFeedEndRef} />
      </div>
      <form className="message-form" onSubmit={(e) => e.preventDefault()}>
        <input
          className="name-input"
          type="text"
          placeholder="Ditt namn"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <input
          className="message-input"
          type="text"
          placeholder="Skriv ett meddelande..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
        <button onClick={sendMessage}>Skicka</button>
      </form>
    </div>
  );
}

export default App;
