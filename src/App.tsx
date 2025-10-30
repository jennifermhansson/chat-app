import { useEffect, useState } from "react";
import "./App.css";
import { io } from "socket.io-client";

// Anslut till servern
const socket = io("ws://10.100.2.139:3001");

function App() {
  const [connected, setConnected] = useState(false);
  const [messages, setMessages] = useState([]);
  const [name, setName] = useState("");
  const [input, setInput] = useState("");

  const connectionStatus = connected ? "✅ Connected" : "❌ Disconnected";

  useEffect(() => {
    socket.on("connect", () => setConnected(true));
    socket.on("disconnect", () => setConnected(false));

    socket.on("chat_room", (data) => {
      try {
        const parsed = JSON.parse(data);
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

    const message = {
      sender: name,
      message: input,
    };

    socket.emit("chat_room", JSON.stringify(message));
    setInput(""); // töm inputfältet efter skickat
  };

  return (
    <div className="chat-container">
      <h2>Realtime Chat</h2>
      <p>{connectionStatus}</p>

      <div className="chat-box">
        {messages.map((m, index) => (
          <div key={index} className="message">
            <strong>{m.sender}:</strong> {m.message}
          </div>
        ))}
      </div>

      <div className="inputs">
        <input
          type="text"
          placeholder="Ditt namn"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <input
          type="text"
          placeholder="Skriv ett meddelande..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
        <button onClick={sendMessage}>Skicka</button>
      </div>
    </div>
  );
}

export default App;
