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
import { useState } from "react";

interface RoomSettingsProps {
  settings: RoomSettingsType;
  onSettingsChange: (settings: RoomSettingsType) => void;
  handleCustomWords: (words: string) => void;
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
  handleCustomWords,
}: RoomSettingsProps) => {
  const updateSetting = <K extends keyof RoomSettingsType>(
    key: K,
    value: RoomSettingsType[K]
  ) => {
    onSettingsChange({ ...settings, [key]: value });
  };

  const [value, setValue] = useState<string>("");

  const generateRandomWords = () => {
    const value = generate();

    setValue(value);
    handleCustomWords(value);
  };

  const generate = () => {
    const arr = [
      "cat, dog, house, car, sun, ninja, robot, dinosaur, unicorn, dragon, airplane, camera, umbrella, skateboard, popcorn, snowman, astronaut, lighthouse, volcano, waterfall",
      "cat, dog, house, car, sun, moon, tree, fish, apple, ball, hat, shoe, book, chair, phone, star, cloud, cake, cup, key",
      "ninja, pirate, robot, monster, ghost, zombie, dinosaur, unicorn, dragon, alien, superhero, clown, wizard, knight, vampire, witch, troll, fairy, mermaid, cowboy",
      "airplane, backpack, camera, toothbrush, umbrella, skateboard, lighthouse, volcano, popcorn, snowman, lighthouse, guitar, microphone, suitcase, telescope, ferris wheel",
      "earthquake, skyscraper, submarine, helicopter, lighthouse, rollercoaster, astronaut, microscope, windmill, waterfall, satellite, compass, hourglass, chandelier",
      "cat, dog, house, car, sun, ninja, robot, dinosaur, unicorn, dragon, airplane, camera, umbrella, skateboard, popcorn, snowman, astronaut, lighthouse, volcano, waterfall",
    ];

    const randomIndex = Math.floor(Math.random() * arr.length)!;
    return arr[randomIndex];
  };

  return (
    <div className="bg-card border border-border rounded-lg h-full flex flex-col">
      <div className="p-3 border-b border-border">
        <h2 className="font-semibold text-foreground">Room Settings</h2>
      </div>
      <div className="p-4 space-y-4 bg-gray-700 w-full">
        <div className="space-y-2 flex justify-between gap-4 w-full">
          <Label htmlFor="playerCount" className="text-neutral-100">
            Players (2-8)
          </Label>
          <Select
            value={settings.players.toString()}
            onValueChange={(v) => updateSetting("players", parseInt(v))}
          >
            <SelectTrigger className="bg-white w-[60%]" id="playerCount">
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

        <div className="space-y-2 flex justify-between gap-4 w-full">
          <Label htmlFor="rounds" className="text-neutral-100">
            Rounds (1-5)
          </Label>
          <Select
            value={settings.rounds.toString()}
            onValueChange={(v) => updateSetting("rounds", parseInt(v))}
          >
            <SelectTrigger className="bg-white w-[60%]" id="rounds">
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

        <div className="space-y-2 flex justify-between gap-4 w-full">
          <Label htmlFor="drawTime" className="text-neutral-100">
            Draw Time
          </Label>
          <Select
            value={settings.draw_time.toString()}
            onValueChange={(v) => updateSetting("draw_time", parseInt(v))}
          >
            <SelectTrigger className="bg-white w-[60%]" id="drawTime">
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

        <div className="space-y-2 flex justify-between gap-4 w-full">
          <Label htmlFor="language" className="text-neutral-100">
            Language
          </Label>
          <Select
            value={settings.language}
            onValueChange={(v) => updateSetting("language", v)}
          >
            <SelectTrigger className="bg-white w-[60%]" id="language">
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
      <div className="p-4 space-y-4 bg-white w-full h-70 flex flex-col">
        <div className="flex justify-between items-center">
          <h2 className="font-semibold text-foreground">Custom Words</h2>
          <p
            onClick={generateRandomWords}
            className="font-semibold text-muted-foreground text-xs border border-border p-2 cursor-pointer"
          >
            Generate words
          </p>
        </div>
        <textarea
          value={value}
          onChange={(e) => {
            setValue(e.target.value);
            handleCustomWords(e.target.value);
          }}
          className="w-full h-full text-sm placeholder:text-sm p-2 resize-none border border-border outline-none"
          placeholder="Write words to guess, seprated by comma ( , )"
        />
      </div>
      <div className="p-4 border-t border-border flex flex-col gap-3">
        <Button className="w-full" onClick={onCreateGame}>
          Create room
        </Button>

        {roomUrl && (
          <div className="flex w-full gap-3">
            <Button className="flex-1" onClick={onStartGame}>
              Start game
            </Button>

            <Button
              className="flex-1 truncate bg-green-600! text-white! hover:opacity-90! hover:bg-green-600!"
              onClick={() => {
                navigator.clipboard.writeText(roomUrl);
              }}
            >
              Share
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};
