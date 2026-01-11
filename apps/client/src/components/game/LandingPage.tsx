import { useState } from "react";
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

interface LandingPageProps {
  onCreateRoom: (name: string, avatar: number, language: string) => void;
}

const languages = [
  { value: "en", label: "English" },
  { value: "es", label: "Spanish" },
  { value: "fr", label: "French" },
  { value: "de", label: "German" },
  { value: "pt", label: "Portuguese" },
];

export const LandingPage = ({ onCreateRoom }: LandingPageProps) => {
  const [playerName, setPlayerName] = useState("");
  const [selectedAvatar, setSelectedAvatar] = useState(0);
  const [language, setLanguage] = useState("en");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (playerName.trim()) {
      onCreateRoom(playerName.trim(), selectedAvatar, language);
    }
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
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="playerName">Your Name</Label>
            <Input
              id="playerName"
              placeholder="Enter your name"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
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
              selectedIndex={selectedAvatar}
              onSelect={setSelectedAvatar}
            />
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={!playerName.trim()}
          >
            Create Private Room
          </Button>
        </form>
      </div>
    </div>
  );
};
