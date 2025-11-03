import { useEffect, useState, useRef } from "react";
import "./App.css";
import { io } from "socket.io-client";

// Anslut till servern
const socket = io("wss://api.leetcode.se", {
  path: "/fos25",
});

type ChatMessage = { 
  sender: string; 
  message: string; 
  time: string; 
};

function App() {
  const [connected, setConnected] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [name, setName] = useState("");
  const [input, setInput] = useState("");
  const [isNearBottom, setIsNearBottom] = useState(true);
  const chatFeedRef = useRef<null | HTMLDivElement>(null);
  const chatFeedEndRef = useRef<null | HTMLDivElement>(null);

  const connectionStatus = connected ? "✅ Connected" : "❌ Disconnected";

  // Ladda historik från localStorage vid start
  useEffect(() => {
    const savedMessages = localStorage.getItem("chatMessages");
    if (savedMessages) {
      try {
        setMessages(JSON.parse(savedMessages));
      } catch {
        console.error("Kunde inte ladda meddelanden från localStorage");
      }
    }
  }, []);

  // Spara till localStorage varje gång messages ändras
  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem("chatMessages", JSON.stringify(messages));
    }
  }, [messages]);

  // Auto-scroll till senaste meddelandet
  useEffect(() => {
    if (isNearBottom) {
      chatFeedEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isNearBottom]);

  // Kolla om användaren är nära botten – annars scrolla inte automatiskt
  const handleScroll = () => {
    const chatFeed = chatFeedRef.current;
    if (!chatFeed) return;
    const distanceFromBottom =
      chatFeed.scrollHeight - chatFeed.scrollTop - chatFeed.clientHeight;
    setIsNearBottom(distanceFromBottom < 50);
  };

  // Hantera sockets (servermeddelanden mm)
  useEffect(() => {
    socket.on("connect", () => setConnected(true));
    socket.on("disconnect", () => setConnected(false));

    socket.on("chat_room", (data) => {
      let message = typeof data === "string" ? JSON.parse(data) : data;

      // Om serverns meddelande saknar tid → ge den en timestamp
      if (!message.time) {
        message.time = new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        });
      }

      setMessages((prev) => [...prev, message]);
    });

    return () => {
      socket.off("connect");
      socket.off("disconnect");
      socket.off("chat_room");
    };
  }, []);

  // Skicka meddelande
  const sendMessage = () => {
    if (!input.trim() || !name.trim()) return;

    const msg: ChatMessage = {
      sender: name,
      message: input,
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    socket.emit("chat_room", msg); // Skicka till servern
    setMessages((prev) => [...prev, msg]); // Visa direkt i UI
    setInput("");
  };

  return (
    <div className="chat">
      <div className="chat__header">
        <h2>Realtime Chat</h2>
        <p>{connectionStatus}</p>
      </div>

      <div ref={chatFeedRef} className="chat__feed" onScroll={handleScroll}>
        {messages.map((msg, index) => (
          <div key={index} className="chat__feed__message">
            <span className="chat__feed__message__sender">{msg.sender}: </span>
            <span className="chat__feed__message__content">{msg.message}</span>
            <span className="chat__feed__message__time">{msg.time}</span>
          </div>
        ))}
        <div ref={chatFeedEndRef} />
      </div>

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
    </div>
  );
}

export default App;
