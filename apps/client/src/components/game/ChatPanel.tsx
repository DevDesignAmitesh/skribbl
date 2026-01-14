import { useState, useRef, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { ChatMessage } from "./types";

interface ChatPanelProps {
  messages: ChatMessage[];
  onSendMessage: (message: string) => void;
  currentPlayerId: string;
}

export const ChatPanel = ({
  messages,
  onSendMessage,
  currentPlayerId,
}: ChatPanelProps) => {
  const [inputValue, setInputValue] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && inputValue.trim()) {
      onSendMessage(inputValue.trim());
      setInputValue("");
    }
  };

  return (
    <div className="bg-card border border-border rounded-lg h-full flex flex-col">
      <div className="p-3 border-b border-border">
        <h2 className="font-semibold text-foreground">Chat</h2>
      </div>
      <div className="flex-1 overflow-y-auto p-3 space-y-1">
        {messages.map((msg) => (
          <div key={msg.id} className="text-sm">
            <span className="font-semibold text-foreground">{msg.from}:</span>{" "}
            <span className="text-muted-foreground">{msg.message}</span>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      <div className="p-3 border-t border-border">
        <Input
          placeholder="Type your guess..."
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
        />
      </div>
    </div>
  );
};
