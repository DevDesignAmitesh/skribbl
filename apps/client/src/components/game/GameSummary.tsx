import { useState, useEffect } from "react";
import { Avatar } from "./AvatarSelector";
import { Confetti } from "./Confetti";
import { Trophy, Medal } from "lucide-react";
import { User } from "@repo/common/common";
import Image from "next/image";
import { characters } from "@/lib/lib";

interface GameSummaryProps {
  players: User[];
  onRestart: () => void;
  redirectTime?: number;
  rightWord: string | null;
}

const getRankIcon = (rank: number) => {
  switch (rank) {
    case 1:
      return <Trophy className="w-5 h-5 text-yellow-500" />;
    case 2:
      return <Medal className="w-5 h-5 text-gray-400" />;
    case 3:
      return <Medal className="w-5 h-5 text-amber-600" />;
    default:
      return (
        <span className="w-5 h-5 text-sm text-muted-foreground font-medium">
          #{rank}
        </span>
      );
  }
};

export const GameSummary = ({
  players,
  onRestart,
  redirectTime = 10,
  rightWord,
}: GameSummaryProps) => {
  const [timeRemaining, setTimeRemaining] = useState(redirectTime);
  const [showConfetti, setShowConfetti] = useState(true);

  // Sort players by score (highest first)
  const sortedPlayers = [...players].sort((a, b) => b.points - a.points);

  useEffect(() => {
    if (rightWord) return;

    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          onRestart();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    // Hide confetti after 4 seconds
    const confettiTimer = setTimeout(() => {
      setShowConfetti(false);
    }, 4000);

    return () => {
      clearInterval(timer);
      clearTimeout(confettiTimer);
    };
  }, [onRestart, rightWord]);

  return (
    <div className="h-full bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
      {showConfetti && !rightWord && <Confetti />}

      <div className="rounded-2xl p-8 max-w-md w-full">
        {rightWord ? (
          <div className="md:text-2xl text-xl font-mono tracking-[0.3em] text-accent text-center mb-4">
            Right word was "{rightWord}"
          </div>
        ) : (
          <h1 className="md:text-2xl text-xl font-bold text-accent text-center mb-6">
            🎉 Game Ends 🎉
          </h1>
        )}

        <div className="bg-muted rounded-xl md:p-3 p-2 md:space-y-2 space-y-1">
          {sortedPlayers.map((player, index) => (
            <div
              key={player.id}
              className={`flex items-center md:gap-2 gap-1 md:p-2 p-1 rounded-md ${
                index === 0
                  ? "bg-yellow-50 border border-yellow-300"
                  : "bg-card"
              }`}
            >
              {/* Rank - smaller, only show top 3 icons */}
              <div className="flex items-center justify-center w-4">
                {index < 3 ? (
                  getRankIcon(index + 1)
                ) : (
                  <span className="text-xs text-muted-foreground">
                    {index + 1}
                  </span>
                )}
              </div>

              {/* Avatar - smaller */}
              <Image
                src={characters[player.character]}
                alt="avatar"
                width={20}
                height={20}
                className="md:w-5 w-4 h-auto shrink-0"
                loading="eager"
              />

              {/* Name - more truncation */}
              <span className="flex-1 text-xs font-medium text-primary truncate min-w-0">
                {player.name}
              </span>

              {/* Points - smaller */}
              <span className="text-xs font-bold text-primary shrink-0">
                {player.points}
              </span>
            </div>
          ))}
        </div>

        {!rightWord && (
          <p className="text-center text-accent md:mt-6 mt-3 md:text-sm text-xs">
            Redirecting in{" "}
            <span className="font-bold text-accent">{timeRemaining}</span>{" "}
            seconds
          </p>
        )}
      </div>
    </div>
  );
};
