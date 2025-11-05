import { useEffect, useState, useRef } from "react";
import "./App.css";
import { io } from "socket.io-client";
import ChatForm from "./components/ChatForm";
import ChatFeed from "./components/ChatFeed";
import type { ChatMessage } from "./types/chat";

const socket = io("wss://api.leetcode.se", {
  path: "/fos25",
});

function App() {
  const [connected, setConnected] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [name, setName] = useState("");
  const [input, setInput] = useState("");
  const [isNearBottom, setIsNearBottom] = useState(true);
  const chatFeedRef = useRef<HTMLDivElement | null>(null);
  const chatFeedEndRef = useRef<HTMLDivElement | null>(null);

  const connectionStatus = connected ? "✅ Connected" : "❌ Disconnected";

  const userList = [
    { user: "Philip", online: true },
    { user: "Jennifer", online: true },
    { user: "Ama", online: false },
    { user: "Maksymilian", online: false },
  ];

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
    <>
      <div className="chat-top-container">
        <div className="chat">
          <div className="chat__header">
            <h2>Realtime Chat</h2>
            <p>{connectionStatus}</p>
          </div>
          <ChatFeed
            messages={messages}
            name={name}
            chatFeedRef={chatFeedRef}
            chatFeedEndRef={chatFeedEndRef}
            handleScroll={handleScroll}
          />
          <ChatForm
            name={name}
            setName={setName}
            input={input}
            setInput={setInput}
            sendMessage={sendMessage}
          />
        </div>
        <div className="online-window">
          <h2>Online status</h2>

          <ul className="online-status">
            {userList.map((user) => (
              <li key={user.user}>
                {user.user}{" "}
                <span style={{ fontSize: "8px" }}>
                  {user.online ? "🟢" : "🔴"}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </>
  );
}

export default App;
