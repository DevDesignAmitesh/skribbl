"use client";

import { useState, useCallback } from "react";
import { LandingPage } from "@/components/game/LandingPage";
import { RoomLayout } from "@/components/game/RoomLayout";
import { RoomSettings } from "@/components/game/RoomSettings";
import { DrawingCanvas } from "@/components/game/DrawingCanvas";
import {
  ViewState,
  Player,
  ChatMessage,
  RoomSettings as RoomSettingsType,
} from "@/components/game/types";

// Mock players data
const mockPlayers: Player[] = [
  { id: "1", name: "You (Admin)", avatarIndex: 0 },
  { id: "2", name: "Alice", avatarIndex: 1 },
  { id: "3", name: "Bob", avatarIndex: 2 },
  { id: "4", name: "Charlie", avatarIndex: 3 },
  { id: "5", name: "Diana", avatarIndex: 4 },
];

export const Main = () => {
  const [view, setView] = useState<ViewState>("landing");
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: "1", playerName: "Alice", message: "Hello everyone!" },
    { id: "2", playerName: "Bob", message: "Ready to play!" },
  ]);
  const [roomSettings, setRoomSettings] = useState<RoomSettingsType>({
    adminName: "",
    adminAvatar: 0,
    playerCount: 4,
    rounds: 3,
    drawTime: 60,
    language: "en",
  });

  const handleCreateRoom = useCallback(
    (name: string, avatar: number, language: string) => {
      setRoomSettings((prev) => ({
        ...prev,
        adminName: name,
        adminAvatar: avatar,
        language,
      }));
      setView("create-room");
    },
    []
  );

  const handleSendMessage = useCallback(
    (message: string) => {
      const newMessage: ChatMessage = {
        id: Date.now().toString(),
        playerName: roomSettings.adminName || "You",
        message,
      };
      setMessages((prev) => [...prev, newMessage]);
    },
    [roomSettings.adminName]
  );

  const handleStartGame = useCallback(() => {
    setView("joined-room");
  }, []);

  // Landing page
  if (view === "landing") {
    return <LandingPage onCreateRoom={handleCreateRoom} />;
  }

  // Room views (create-room and joined-room share the same layout)
  const players: Player[] = [
    {
      id: "admin",
      name: roomSettings.adminName || "You",
      avatarIndex: roomSettings.adminAvatar,
    },
    ...mockPlayers.slice(1),
  ];

  return (
    <RoomLayout
      players={players}
      messages={messages}
      onSendMessage={handleSendMessage}
      currentPlayerName={roomSettings.adminName || "You"}
      centerContent={
        view === "create-room" ? (
          <RoomSettings
            settings={roomSettings}
            onSettingsChange={setRoomSettings}
            onStartGame={handleStartGame}
          />
        ) : (
          <DrawingCanvas />
        )
      }
    />
  );
};
