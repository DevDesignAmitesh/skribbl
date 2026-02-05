"use client";

import { BlueButton, GreenButton } from "@/components/new/buttons";
import { Footer } from "@/components/new/footer";
import { LandingAbout } from "@/components/new/landing-about";
import { LandingHead } from "@/components/new/landing-head";
import { LandingHowToPlay } from "@/components/new/landing-how-to-play";
import { LandingNews } from "@/components/new/landing-news";
import { SvgArrowLeft, SvgArrowRight } from "@/components/new/svg-arrow";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useRestContext } from "@/context/rest";
import { useWsContext } from "@/context/ws";
import { characters, languages, MAX_CHARACTER } from "@/lib/lib";
import Image from "next/image";
import { useState } from "react";

export default function Landing({ roomId }: { roomId: string | null }) {
  const [character, setCharacter] = useState(1);
  const [name, setName] = useState<string>("");
  const [lng, setLng] = useState<string>("en");

  const handleCharacter = (action: "forward" | "back") => {
    if (action === "back") {
      setCharacter((prev) => {
        if (prev === 1) return MAX_CHARACTER;
        return prev - 1;
      });
    } else if (action === "forward") {
      setCharacter((prev) => {
        if (prev === MAX_CHARACTER) return 1;
        return prev + 1;
      });
    }
  };

  const { handleSetView } = useRestContext();
  const { handleRoomJoin } = useWsContext();
  return (
    <div className="h-auto w-full bg-[url(/landing-bg.png)]">
      {/* section one */}
      <div className="w-full py-4 flex flex-col gap-10 justify-center items-center">
        {/* header */}
        <LandingHead />

        {/* create/join room */}
        <div className="w-full max-w-sm h-auto bg-blue-900 p-4 flex flex-col justify-start items-center">
          {/* name and language section */}
          <div className="flex justify-center items-center gap-2 w-full">
            <Input
              id="playerName"
              placeholder="Enter your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={20}
              className="bg-white text-neutral-900 font-semibold"
            />
            <Select value={lng} onValueChange={(v) => setLng(v)}>
              <SelectTrigger className="bg-white w-[50%]">
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

          {/* chose character */}
          <div className="flex justify-center items-center gap-4 mt-4">
            <SvgArrowLeft onClick={() => handleCharacter("back")} />
            <Image
              src={characters[character]}
              alt="avatar"
              width={100}
              height={100}
              className="w-auto h-auto"
              loading="eager"
            />
            <SvgArrowRight onClick={() => handleCharacter("forward")} />
          </div>

          {/* CTAs FOR play or create room */}
          <div className="flex flex-col justify-center items-center gap-2 w-full mt-4">
            <GreenButton
              label="Play !"
              onClick={() => handleRoomJoin(roomId, name, character, lng)}
            />
            <BlueButton
              label="Create private room"
              onClick={() => handleSetView("create-room")}
            />
          </div>
        </div>
      </div>

      {/* section two */}
      <div className="w-full bg-[#123596] pt-16 pb-10">
        <div className="w-full max-w-5xl mx-auto px-4 grid lg:grid-cols-3 gap-4 justify-center items-start">
          {/* about section */}
          <LandingAbout />

          {/* news section */}
          <LandingNews />

          {/* how to play section */}
          <LandingHowToPlay />
        </div>
        <Footer />
      </div>
    </div>
  );
}
