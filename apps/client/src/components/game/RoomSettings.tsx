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
import { RoomSettings as RoomSettingsType } from "./types";

interface RoomSettingsProps {
  settings: RoomSettingsType;
  onSettingsChange: (settings: RoomSettingsType) => void;
  onStartGame: () => void;
}

const languages = [
  { value: "en", label: "English" },
  { value: "es", label: "Spanish" },
  { value: "fr", label: "French" },
  { value: "de", label: "German" },
  { value: "pt", label: "Portuguese" },
];

export const RoomSettings = ({
  settings,
  onSettingsChange,
  onStartGame,
}: RoomSettingsProps) => {
  const updateSetting = <K extends keyof RoomSettingsType>(
    key: K,
    value: RoomSettingsType[K]
  ) => {
    onSettingsChange({ ...settings, [key]: value });
  };

  return (
    <div className="bg-card border border-border rounded-lg h-full flex flex-col">
      <div className="p-3 border-b border-border">
        <h2 className="font-semibold text-foreground">Room Settings</h2>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <div className="space-y-2">
          <Label htmlFor="adminName">Your Name</Label>
          <Input
            id="adminName"
            value={settings.adminName}
            onChange={(e) => updateSetting("adminName", e.target.value)}
            maxLength={20}
          />
        </div>

        <div className="space-y-2">
          <Label>Your Avatar</Label>
          <AvatarSelector
            selectedIndex={settings.adminAvatar}
            onSelect={(index) => updateSetting("adminAvatar", index)}
            size="sm"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="playerCount">Players (2-8)</Label>
          <Select
            value={settings.playerCount.toString()}
            onValueChange={(v) => updateSetting("playerCount", parseInt(v))}
          >
            <SelectTrigger id="playerCount">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {[2, 3, 4, 5, 6, 7, 8].map((n) => (
                <SelectItem key={n} value={n.toString()}>
                  {n} players
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="rounds">Rounds (1-5)</Label>
          <Select
            value={settings.rounds.toString()}
            onValueChange={(v) => updateSetting("rounds", parseInt(v))}
          >
            <SelectTrigger id="rounds">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {[1, 2, 3, 4, 5].map((n) => (
                <SelectItem key={n} value={n.toString()}>
                  {n} {n === 1 ? "round" : "rounds"}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="drawTime">Draw Time</Label>
          <Select
            value={settings.drawTime.toString()}
            onValueChange={(v) => updateSetting("drawTime", parseInt(v))}
          >
            <SelectTrigger id="drawTime">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {[30, 45, 60, 90, 120].map((n) => (
                <SelectItem key={n} value={n.toString()}>
                  {n} seconds
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="language">Language</Label>
          <Select
            value={settings.language}
            onValueChange={(v) => updateSetting("language", v)}
          >
            <SelectTrigger id="language">
              <SelectValue />
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
      </div>
      <div className="p-4 border-t border-border">
        <Button className="w-full" onClick={onStartGame}>
          Start Game
        </Button>
      </div>
    </div>
  );
};
