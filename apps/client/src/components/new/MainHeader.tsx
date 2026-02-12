import Image from "next/image";
import { Logo } from "./logo";
import { useRestContext } from "@/context/rest";
import { useEffect, useRef, useState } from "react";
import { useWsContext } from "@/context/ws";
import { formatHalfWord, formatHiddenWord } from "@/lib/lib";

export const MainHeader = () => {
  const { room, rightWord, halfWord, totalLength } = useRestContext();
  const { handleHalfTime, handleStartRoom } = useWsContext();

  const [timeRemaining, setTimeRemaining] = useState(() =>
    Math.max(0, Math.ceil((room.room?.roundEndsAt! - Date.now()) / 1000)),
  );

  const halftimeRef = useRef<boolean>(false);

  const onTimeUp = () => {
    handleStartRoom();
  };

  const onHalfTime = () => {
    handleHalfTime();
  };

  useEffect(() => {
    if(room.room?.status === "creating" || room.room?.status === "ended") return;
    
    const interval = setInterval(() => {
      const remaining = Math.max(
        0,
        Math.ceil((room.room?.roundEndsAt! - Date.now()) / 1000),
      );

      setTimeRemaining(remaining);
      if (!halftimeRef.current) {
        if (remaining <= Math.floor(room.room?.draw_time! / 2)) {
          // TODO: we can check here if the user is already guessed or not, this will save
          // us a server call
          onHalfTime?.();
          halftimeRef.current = true;
        }
      }

      if (remaining === 0) {
        clearInterval(interval);
        onTimeUp();
      }
    }, 500); // 500ms = smoother + safer

    return () => clearInterval(interval);
  }, [room.room?.roundEndsAt!, onTimeUp, room.room?.status]);

  const isLowTime = timeRemaining <= 10;

  return (
    <header className="w-full flex flex-col justify-center items-start gap-2 text-neutral-800">
      <Logo width="w-xs" />
      <div className="w-full flex justify-between items-center bg-white pr-2">
        {/* timer and round */}
        <div className="flex items-center gap-4">
          <div className="relative flex items-center justify-center">
            <Image
              unoptimized
              src="/clock.gif"
              alt="timer"
              width={40}
              height={40}
              className="w-16 h-auto"
              loading="eager"
            />
            {/* timer number */}
            <span
              className={`absolute z-20 text-lg font-semibold text-black drop-shadow-md ${
                isLowTime ? "text-destructive animate-pulse" : "text-foreground"
              }`}
            >
              {room.room?.status === "ongoing" ? timeRemaining : 0}s
            </span>
          </div>

          <p className="text-xl font-semibold">
            Round {room.room?.latest_round} of {room.room?.rounds}
          </p>
        </div>

        {/* game header */}
        {room.room?.status === "creating" ? (
          <p className="text-sm font-bold text-neutral-700">WAITING</p>
        ) : (
          <div className="rounded-lg flex items-center py-1 justify-center">
            {/* Hidden Word - Center */}
            <div className="flex-1 flex justify-center">
              <div className="text-2xl font-mono tracking-[0.3em] text-foreground">
                {rightWord ? (
                  <span>{rightWord}</span>
                ) : halfWord.length > 0 ? (
                  formatHalfWord(halfWord, totalLength)
                ) : (
                  formatHiddenWord(totalLength)
                )}
              </div>
            </div>
          </div>
        )}

        {/* setting icon (MOCK) */}
        <Image
          unoptimized
          src={"/settings.gif"}
          alt="logo"
          width={70}
          height={70}
          className="w-auto h-auto"
          loading="eager"
        />
      </div>
    </header>
  );
};
