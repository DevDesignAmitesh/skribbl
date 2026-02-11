import { useState, useEffect } from "react";
import { Avatar } from "./AvatarSelector";
import { Confetti } from "./Confetti";
import { Trophy, Medal } from "lucide-react";
import { User } from "@repo/common/common";

interface GameSummaryProps {
  players: User[];
  onRestart: () => void;
  redirectTime?: number;
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
}: GameSummaryProps) => {
  const [timeRemaining, setTimeRemaining] = useState(redirectTime);
  const [showConfetti, setShowConfetti] = useState(true);

  // Sort players by score (highest first)
  const sortedPlayers = [...players].sort((a, b) => b.points - a.points);

  useEffect(() => {
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
  }, [onRestart]);

  return (
    <div className="h-full bg-secondary flex items-center justify-center p-4">
      {showConfetti && <Confetti />}

      <div className="bg-card border border-border rounded-2xl p-8 max-w-md w-full shadow-lg">
        <h1 className="text-2xl font-bold text-foreground text-center mb-6">
          🎉 Game Ends 🎉
        </h1>

        <div className="bg-muted rounded-xl p-4 space-y-3">
          {sortedPlayers.map((player, index) => (
            <div
              key={player.id}
              className={`flex items-center gap-3 p-3 rounded-lg border ${
                index === 0
                  ? "bg-yellow-50 border-yellow-300"
                  : "bg-card border-border"
              }`}
            >
              <div className="flex items-center justify-center w-6">
                {getRankIcon(index + 1)}
              </div>
              <Avatar index={player.character} size="sm" />
              <span className="flex-1 text-sm font-medium text-foreground truncate">
                {player.name}
              </span>
              <span className="text-sm font-bold text-primary">
                {player.points}
              </span>
            </div>
          ))}
        </div>

        <p className="text-center text-muted-foreground mt-6 text-sm">
          Redirecting in{" "}
          <span className="font-bold text-foreground">{timeRemaining}</span>{" "}
          seconds
        </p>
      </div>
    </div>
  );
};
