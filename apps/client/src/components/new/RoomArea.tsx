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

export const RoomArea = () => {
  const generate = () => {
    const randomIndex = Math.floor(Math.random() * random_words.length)!;
    return random_words[randomIndex];
  };

  const generateRandomWords = () => {
    const value = generate();
  };
  return (
    <div className="w-full h-auto bg-[#35394A] text-neutral-100 p-2 flex flex-col justify-start items-center">
      {/* room settings area */}

      <div className="w-full grid gap-2">
        {/* palyers input */}
        <div className="w-full flex justify-between items-center gap-4">
          <div className="flex justify-center items-center gap-1">
            <Image
              unoptimized
              src={"/settings/setting_1.gif"}
              alt="logo"
              width={20}
              height={20}
              className="w-8"
              loading="eager"
            />
            <p className="text-sm">Players</p>
          </div>

          <Select
            value={String(3)}
            // onValueChange={(v) => {}}
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

        {/* language input */}
        <div className="w-full flex justify-between items-center gap-4">
          <div className="flex justify-center items-center gap-1">
            <Image
              unoptimized
              src={"/settings/setting_0.gif"}
              alt="logo"
              width={20}
              height={20}
              className="w-8"
              loading="eager"
            />
            <p className="text-sm">Languages</p>
          </div>

          <Select
            value={"en"}
            // onValueChange={(v) => {}}
          >
            <SelectTrigger
              className="bg-white text-neutral-900 w-[60%]"
              id="language"
            >
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

        {/* draw time input */}
        <div className="w-full flex justify-between items-center gap-4">
          <div className="flex justify-center items-center gap-1">
            <Image
              unoptimized
              src={"/settings/setting_2.gif"}
              alt="logo"
              width={20}
              height={20}
              className="w-8"
              loading="eager"
            />
            <p className="text-sm">Draw time</p>
          </div>

          <Select
            value={String(45)}
            // onValueChange={(v) => {}}
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

        {/* rounds input */}
        <div className="w-full flex justify-between items-center gap-4">
          <div className="flex justify-center items-center gap-1">
            <Image
              unoptimized
              src={"/settings/setting_3.gif"}
              alt="logo"
              width={20}
              height={20}
              className="w-8"
              loading="eager"
            />
            <p className="text-sm">Rounds</p>
          </div>

          <Select
            value={String(2)}
            // onValueChange={(v) => {}}
          >
            <SelectTrigger className="bg-white text-neutral-900 w-[60%]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {[1, 2, 3, 4, 5].map((plr) => (
                <SelectItem key={plr} value={String(plr)}>
                  {plr}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* custom words input */}

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
            // value={"pending"}
            // onChange={(e) => {}}
            className="w-full h-full text-sm placeholder:text-sm p-2 resize-none border border-border outline-none bg-white text-neutral-900"
            placeholder="Example: cat, dog, house, car, sun"
          />
        </div>

        {/* buttons */}
        <div className="w-full flex justify-center items-center gap-1">
          <GreenButton label="Start!" onClick={() => {}} />
          <BlueButton label="Invite" onClick={() => {}} />
        </div>
      </div>
    </div>
  );
};
