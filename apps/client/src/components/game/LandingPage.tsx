import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AvatarSelector } from "./AvatarSelector";
import { MESSAGE_TYPE } from "@repo/common/common";
import { Player } from "./types";

interface LandingPageProps {
  createRoom: () => void;
  ws: WebSocket;
  roomId: string | null;
  player: Player;
  setPlayer: React.Dispatch<React.SetStateAction<Player>>;
  setLanguage: React.Dispatch<React.SetStateAction<string>>;
  language: string;
}

const languages = [
  { value: "en", label: "English" },
  { value: "es", label: "Spanish" },
  { value: "fr", label: "French" },
  { value: "de", label: "German" },
  { value: "pt", label: "Portuguese" },
];

export const LandingPage = ({
  createRoom,
  ws,
  roomId,
  player,
  language,
  setLanguage,
  setPlayer,
}: LandingPageProps) => {
  const handleJoin = () => {
    if (!player.name.trim()) {
      alert("enter your name");
      return;
    }

    if (roomId) {
      ws.send(
        JSON.stringify({
          type: MESSAGE_TYPE.JOIN_ROOM,
          data: {
            roomId,
            name: player.name,
            character: player.avatarIndex,
          },
        })
      );

      return;
    }

    ws.send(
      JSON.stringify({
        type: MESSAGE_TYPE.JOIN_RANDOM,
        data: {
          name: player.name,
          character: player.avatarIndex,
          language,
        },
      })
    );
  };

  return (
    <div className="min-h-screen bg-secondary flex items-center justify-center p-4">
      <div className="bg-card border border-border rounded-lg shadow-sm w-full max-w-md p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Draw & Guess
          </h1>
          <p className="text-muted-foreground">
            A fun multiplayer drawing game
          </p>
        </div>

        {/* How to Play */}
        <div className="bg-muted rounded-lg p-4 mb-6">
          <h2 className="font-semibold text-foreground mb-2">How to Play</h2>
          <ol className="text-sm text-muted-foreground space-y-1 list-decimal list-inside">
            <li>Create or join a private room</li>
            <li>Take turns drawing the secret word</li>
            <li>Other players guess the word in chat</li>
            <li>Score points for correct guesses!</li>
          </ol>
        </div>

        {/* Form */}
        <div className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="playerName">Your Name</Label>
            <Input
              id="playerName"
              placeholder="Enter your name"
              value={player.name}
              onChange={(e) =>
                setPlayer((prev) => ({
                  ...prev,
                  name: e.target.value,
                }))
              }
              maxLength={20}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="language">Language</Label>
            <Select value={language} onValueChange={setLanguage}>
              <SelectTrigger id="language">
                <SelectValue placeholder="Select language" />
              </SelectTrigger>
              <SelectContent>
                {languages.map((lang) => (
                  <SelectItem key={lang.value} value={lang.value}>
                    {lang.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Choose Your Avatar</Label>
            <AvatarSelector
              selectedIndex={player.avatarIndex}
              onSelect={(e) =>
                setPlayer((prev) => ({
                  ...prev,
                  avatarIndex: e,
                }))
              }
            />
          </div>

          <Button
            onClick={handleJoin}
            className="w-full"
            disabled={!player.name.trim()}
          >
            Join Room
          </Button>
          <Button onClick={createRoom} className="w-full" variant={"outline"}>
            Create Private Room
          </Button>
        </div>
      </div>
    </div>
  );
};
