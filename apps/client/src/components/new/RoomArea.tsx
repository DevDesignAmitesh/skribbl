import Image from "next/image";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { languages, random_words } from "@/lib/lib";
import { BlueButton, GreenButton } from "./buttons";
import { useState } from "react";
import { useWsContext } from "@/context/ws";
import { useRestContext } from "@/context/rest";

export const RoomArea = () => {
  const [players, setPlayers] = useState<number>(3);
  const [language, setLanguage] = useState<string>("en");
  const [drawTime, setDrawTime] = useState<number>(45);
  const [rounds, setRounds] = useState<number>(2);
  const [customWords, setCustomWords] = useState<string>("");

  const generate = () => {
    const randomIndex = Math.floor(Math.random() * random_words.length);
    return random_words[randomIndex];
  };

  const generateRandomWords = () => {
    const words = generate();
    setCustomWords(words);
  };

  const { handleCreateRoom, handleStartRoom } = useWsContext();
  const { roomId } = useRestContext();

  return (
    <div className="w-full h-auto bg-[#35394A] text-neutral-100 p-2 flex flex-col justify-start items-center">
      <div className="w-full grid gap-2">
        {/* players */}
        <div className="w-full flex justify-between items-center gap-4">
          <div className="flex items-center gap-1">
            <Image
              unoptimized
              src="/settings/setting_1.gif"
              alt="logo"
              width={20}
              height={20}
              className="w-8"
            />
            <p className="text-sm">Players</p>
          </div>

          <Select
            value={String(players)}
            onValueChange={(v) => setPlayers(Number(v))}
          >
            <SelectTrigger className="bg-white text-neutral-900 w-[60%]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {[1, 2, 3, 4, 5, 6, 7, 8].map((plr) => (
                <SelectItem key={plr} value={String(plr)}>
                  {plr}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* language */}
        <div className="w-full flex justify-between items-center gap-4">
          <div className="flex items-center gap-1">
            <Image
              unoptimized
              src="/settings/setting_0.gif"
              alt="logo"
              width={20}
              height={20}
              className="w-8"
            />
            <p className="text-sm">Languages</p>
          </div>

          <Select value={language} onValueChange={setLanguage}>
            <SelectTrigger className="bg-white text-neutral-900 w-[60%]">
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

        {/* draw time */}
        <div className="w-full flex justify-between items-center gap-4">
          <div className="flex items-center gap-1">
            <Image
              unoptimized
              src="/settings/setting_2.gif"
              alt="logo"
              width={20}
              height={20}
              className="w-8"
            />
            <p className="text-sm">Draw time</p>
          </div>

          <Select
            value={String(drawTime)}
            onValueChange={(v) => setDrawTime(Number(v))}
          >
            <SelectTrigger className="bg-white text-neutral-900 w-[60%]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {[30, 45, 60, 75, 90].map((val) => (
                <SelectItem key={val} value={String(val)}>
                  {val}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* rounds */}
        <div className="w-full flex justify-between items-center gap-4">
          <div className="flex items-center gap-1">
            <Image
              unoptimized
              src="/settings/setting_3.gif"
              alt="logo"
              width={20}
              height={20}
              className="w-8"
            />
            <p className="text-sm">Rounds</p>
          </div>

          <Select
            value={String(rounds)}
            onValueChange={(v) => setRounds(Number(v))}
          >
            <SelectTrigger className="bg-white text-neutral-900 w-[60%]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {[1, 2, 3, 4, 5].map((val) => (
                <SelectItem key={val} value={String(val)}>
                  {val}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* custom words */}
        <div className="text-neutral-100 w-full h-70 flex flex-col gap-2">
          <div className="flex justify-between items-center">
            <h2 className="font-semibold">Custom Words</h2>
            <p
              onClick={generateRandomWords}
              className="font-semibold text-xs border border-border p-2 cursor-pointer"
            >
              Generate words
            </p>
          </div>

          <textarea
            value={customWords}
            onChange={(e) => setCustomWords(e.target.value)}
            className="w-full h-full text-sm p-2 resize-none border border-border outline-none bg-white text-neutral-900"
            placeholder="Example: cat, dog, house, car, sun"
          />
        </div>

        {/* buttons */}
        <div className="w-full flex justify-center items-center gap-1">
          {!roomId ? (
            <GreenButton
              label="Create"
              onClick={() =>
                handleCreateRoom({
                  id: crypto.randomUUID().slice(0, 7),
                  custom_word: customWords.split(", "),
                  draw_time: drawTime,
                  language,
                  players,
                  rounds,
                  status: "creating",
                })
              }
            />
          ) : (
            <GreenButton label="Start!" onClick={handleStartRoom} />
          )}
          {roomId && (
            <BlueButton
              label="Invite"
              onClick={() =>
                window.navigator.clipboard.writeText(
                  `${window.location.hostname}?roomId=${roomId}`,
                )
              }
            />
          )}
        </div>
      </div>
    </div>
  );
};
