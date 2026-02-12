import { useState, useRef, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { ChatMessage } from "./types";
import Sound from "react-sound";
import { useWsContext } from "@/context/ws";

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

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && inputValue.trim()) {
      onSendMessage(inputValue.trim());
      setInputValue("");
    }
  };

  const { roomJoin, roomLeft } = useWsContext();

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <>
      <div className="bg-card border border-border rounded-lg h-full flex flex-col">
        <div className="flex-1 overflow-y-auto p-3 space-y-1">
          {messages.map((msg) => (
            <div key={msg.id} className="text-sm">
              <span className="font-semibold text-foreground">{msg.from}:</span>{" "}
              <span className="text-muted-foreground">{msg.message}</span>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
        <div className="border-t border-border">
          <Input
            className="text-sm"
            placeholder="Type your guess..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
          />
        </div>
      </div>

      {roomLeft && <Sound url="/leave.mp3" playStatus="PLAYING" />}
      {roomJoin && <Sound url="/join.mp3" playStatus="PLAYING" />}
    </>
  );
};
