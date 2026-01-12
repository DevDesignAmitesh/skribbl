import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RoomSettings as RoomSettingsType } from "./types";

interface RoomSettingsProps {
  settings: RoomSettingsType;
  onSettingsChange: (settings: RoomSettingsType) => void;
  onCreateGame: () => void;
  onStartGame: () => void;
  roomUrl: string | null;
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
  onCreateGame,
  roomUrl,
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
          <Label htmlFor="playerCount">Players (2-8)</Label>
          <Select
            value={settings.players.toString()}
            onValueChange={(v) => updateSetting("players", parseInt(v))}
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
            value={settings.draw_time.toString()}
            onValueChange={(v) => updateSetting("draw_time", parseInt(v))}
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
        <Button className="w-full" onClick={onCreateGame}>
          Create room
        </Button>
        <Button className="w-full" onClick={onStartGame}>
          Start game
        </Button>
        {roomUrl && (
          <Button
            variant={"outline"}
            className="w-full"
            onClick={() => {
              navigator.clipboard.writeText(roomUrl);
              alert("text copied");
            }}
          >
            Share : {roomUrl}
          </Button>
        )}
      </div>
    </div>
  );
};
