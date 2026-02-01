import { HalfWord } from "@repo/common/common";
import { useEffect, useRef, useState } from "react";

interface GameHeaderProps {
  currentRound: number;
  drawtime: number;
  onHalfTime?: () => void;
  rightWord: string | null;
  totalRounds: number;
  totalLength: number[];
  halfWord: HalfWord[];
  roundEndsAt: number;
  onTimeUp?: () => void;
}

const formatHiddenWord = (totalLength: number[]) => {
  // input eg: [4, 5]
  return totalLength.map((nm, groupIdx) => {
    const arr = Array.from({ length: nm });

    return (
      <div key={groupIdx} className="inline-block mr-4">
        {arr.map((_, idx) => (
          <span key={idx} className="mr-1">
            _
          </span>
        ))}
      </div>
    );
  });
};

const formatHalfWord = (word: HalfWord[], totalLength: number[]) => {
  // input eg: [4, 5]
  return totalLength.map((nm, groupIdx) => {
    const arr = Array.from({ length: nm });

    return (
      <div key={groupIdx} className="inline-block mr-4">
        {arr.map((_, idx) => {
          const halfWord = word.find((wr) => wr.idx == idx);
          if (halfWord) {
            return (
              <span key={idx} className="mr-1">
                {halfWord.elm}
              </span>
            );
          }
          return (
            <span key={idx} className="mr-1">
              _
            </span>
          );
        })}
      </div>
    );
  });
};

export const GameHeader = ({
  currentRound,
  totalRounds,
  totalLength,
  roundEndsAt,
  halfWord,
  onTimeUp,
  rightWord,
  drawtime,
  onHalfTime,
}: GameHeaderProps) => {
  const [timeRemaining, setTimeRemaining] = useState(() =>
    Math.max(0, Math.ceil((roundEndsAt - Date.now()) / 1000)),
  );

  const halftimeRef = useRef<boolean>(false);

  useEffect(() => {
    const interval = setInterval(() => {
      const remaining = Math.max(
        0,
        Math.ceil((roundEndsAt - Date.now()) / 1000),
      );

      setTimeRemaining(remaining);
      if (!halftimeRef.current) {
        if (remaining <= Math.floor(drawtime / 2)) {
          // TODO: we can check here if the user is already guessed or not, this will save
          // us a server call
          onHalfTime?.();
          halftimeRef.current = true;
        }
      }

      if (remaining === 0) {
        clearInterval(interval);
        onTimeUp?.();
      }
    }, 500); // 500ms = smoother + safer

    return () => clearInterval(interval);
  }, [roundEndsAt, onTimeUp]);

  const isLowTime = timeRemaining <= 10;

  return (
    <div className="bg-card border border-border rounded-lg px-6 py-3 flex items-center justify-between">
      {/* Round Counter - Left */}
      <div className="flex items-center gap-2 min-w-30">
        <span className="text-sm text-muted-foreground">Round</span>
        <span className="text-lg font-bold text-foreground">
          {currentRound} of {totalRounds}
        </span>
      </div>

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

      {/* Timer - Right */}
      <div className="flex items-center gap-2 min-w-30 justify-end">
        <div
          className={`text-2xl font-bold tabular-nums ${
            isLowTime ? "text-destructive animate-pulse" : "text-foreground"
          }`}
        >
          {timeRemaining}s
        </div>
      </div>
    </div>
  );
};
