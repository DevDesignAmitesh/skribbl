import { useEffect, useState } from "react";

interface GameHeaderProps {
  currentRound: number;
  totalRounds: number;
  totalLength: number[];
  roundEndsAt: number;
  onTimeUp?: () => void;
}

const formatHiddenWord = (totalLength: number[]) => {
  // for eg: [4, 5]
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

export const GameHeader = ({
  currentRound,
  totalRounds,
  totalLength,
  roundEndsAt,
  onTimeUp,
}: GameHeaderProps) => {
  const [timeRemaining, setTimeRemaining] = useState(() =>
    Math.max(0, Math.ceil((roundEndsAt - Date.now()) / 1000)),
  );

  useEffect(() => {
    const interval = setInterval(() => {
      const remaining = Math.max(
        0,
        Math.ceil((roundEndsAt - Date.now()) / 1000),
      );

      setTimeRemaining(remaining);

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
          {formatHiddenWord(totalLength)}
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
