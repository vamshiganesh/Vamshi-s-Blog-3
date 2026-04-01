import { useState } from "react";
import { motion } from "framer-motion";
import { MessageCircleHeart, Send } from "lucide-react";

interface Message {
  id: string;
  text: string;
  sender: "ai" | "user";
}

const aiResponses = [
  "That's wonderful to hear! Remember to stay hydrated today. 💧",
  "I'm glad you're feeling well! Have you taken your afternoon medicine yet?",
  "That sounds lovely! Your daughter Sarah checked in earlier — she sends her love. ❤️",
  "Great job on your walk today! You've been so active this week. 🎉",
  "I'm always here if you need anything. How about we check off your evening tasks?",
  "Your vitals look great today! Keep up the good work. 😊",
];

const CompanionChat = () => {
  const [messages, setMessages] = useState<Message[]>([
    { id: "1", text: "Good afternoon! How are you feeling today? 😊", sender: "ai" },
  ]);
  const [input, setInput] = useState("");

  const sendMessage = () => {
    if (!input.trim()) return;
    const userMsg: Message = { id: Date.now().toString(), text: input, sender: "user" };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");

    // Simulate AI response
    setTimeout(() => {
      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        text: aiResponses[Math.floor(Math.random() * aiResponses.length)],
        sender: "ai",
      };
      setMessages((prev) => [...prev, aiMsg]);
    }, 1000);
  };

  return (
    <div className="space-y-3 flex flex-col h-full">
      <h2 className="text-xl font-heading font-bold text-foreground flex items-center gap-2">
        <MessageCircleHeart className="w-5 h-5 text-success" />
        AI Companion
      </h2>

      <div className="flex-1 space-y-2 overflow-y-auto max-h-[280px] pr-1">
        {messages.map((msg) => (
          <motion.div
            key={msg.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`p-3 rounded-2xl max-w-[85%] text-base font-body ${
              msg.sender === "ai"
                ? "bg-accent text-accent-foreground rounded-tl-sm"
                : "bg-primary text-primary-foreground rounded-tr-sm ml-auto"
            }`}
          >
            {msg.text}
          </motion.div>
        ))}
      </div>

      <div className="flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          placeholder="Type a message..."
          className="flex-1 p-3 rounded-xl bg-card border border-border text-foreground font-body text-base focus:outline-none focus:ring-2 focus:ring-primary"
        />
        <button
          onClick={sendMessage}
          className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center hover:scale-105 transition-transform"
        >
          <Send className="w-5 h-5 text-primary-foreground" />
        </button>
      </div>
    </div>
  );
};

export default CompanionChat;
