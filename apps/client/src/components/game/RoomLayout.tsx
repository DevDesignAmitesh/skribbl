import { ReactNode } from "react";
import { PlayersList } from "./PlayersList";
import { ChatPanel } from "./ChatPanel";
import { ChatMessage } from "./types";
import { User } from "@repo/common/common";

interface RoomLayoutProps {
  players: User[];
  messages: ChatMessage[];
  onSendMessage: (message: string) => void;
  currentPlayerName: string;
  centerContent: ReactNode;
}

export const RoomLayout = ({
  players,
  messages,
  onSendMessage,
  currentPlayerName,
  centerContent,
}: RoomLayoutProps) => {
  return (
    <div className="min-h-screen bg-secondary p-4">
      <div className="max-w-7xl mx-auto h-[calc(100vh-2rem)] grid grid-cols-[250px_1fr_280px] gap-4">
        {/* Left Panel - Players */}
        <PlayersList players={players} />

        {/* Center Panel */}
        {centerContent}

        {/* Right Panel - Chat */}
        <ChatPanel
          messages={messages}
          onSendMessage={onSendMessage}
          currentPlayerName={currentPlayerName}
        />
      </div>
    </div>
  );
};
