import { useEffect, useState, useRef } from "react";
import "./App.css";
import { io } from "socket.io-client";

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
  const chatFeedRef = useRef<HTMLDivElement | null>(null);
  const chatFeedEndRef = useRef<HTMLDivElement | null>(null);

  const connectionStatus = connected ? "✅ Connected" : "❌ Disconnected";

  // Hämta namn vid start från local storage
useEffect(() => {
  const savedName = localStorage.getItem("chatName");
  if (savedName) {
    setName(savedName);
  }
}, []);

// Spara namnet i local storage 
useEffect(() => {
  if (name.trim() !== "") {
    localStorage.setItem("chatName", name);
  }
}, [name]);


  // Ladda meddelanden från localStorage
  useEffect(() => {
    const saved = localStorage.getItem("chatMessages");
    if (saved) {
      try {
        setMessages(JSON.parse(saved));
      } catch {}
    }
  }, []);

  // Spara meddelandet i localStorage
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

  const handleScroll = () => {
    const chatFeed = chatFeedRef.current;
    if (!chatFeed) return;
    const distance =
      chatFeed.scrollHeight - chatFeed.scrollTop - chatFeed.clientHeight;
    setIsNearBottom(distance < 50);
  };

  // Socket.io – ta emot meddelanden
  useEffect(() => {
    socket.on("connect", () => setConnected(true));
    socket.on("disconnect", () => setConnected(false));

    socket.on("chat_room", (data) => {
      let message = typeof data === "string" ? JSON.parse(data) : data;

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
      time: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };

    socket.emit("chat_room", msg);
    setMessages((prev) => [...prev, msg]);
    setInput("");
  };

  return (
    <div className="chat">
      <div className="chat__header">
        <h2>Realtime Chat</h2>
        <p>{connectionStatus}</p>
      </div>

   <div ref={chatFeedRef} className="chat__feed" onScroll={handleScroll}>
       {messages.map((msg, index) => {
const isMyMessage = msg.sender.trim().toLowerCase() === name.trim().toLowerCase();
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
