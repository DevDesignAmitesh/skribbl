import { Trophy, Medal } from "lucide-react";
import { Avatar } from "./AvatarSelector";
import { User } from "@repo/common/common";

interface PlayersListProps {
  players: User[];
  currentPlayerId: string;
}

const getRankIcon = (rank: number) => {
  switch (rank) {
    case 1:
      return <Trophy className="w-4 h-4 text-yellow-500" />;
    case 2:
      return <Medal className="w-4 h-4 text-gray-400" />;
    case 3:
      return <Medal className="w-4 h-4 text-amber-600" />;
    default:
      return (
        <span className="w-4 h-4 text-xs text-muted-foreground font-medium">
          #{rank}
        </span>
      );
  }
};

export const PlayersList = ({ players, currentPlayerId }: PlayersListProps) => {
  // Sort players by score (highest first)
  const sortedPlayers = [...players].sort((a, b) => b.points - a.points);

  return (
    <div className="bg-card border border-border rounded-lg h-full flex flex-col">
      <div className="p-3 border-b border-border">
        <h2 className="font-semibold text-foreground">
          Players ({players.length})
        </h2>
      </div>
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {sortedPlayers.map((player, index) => (
          <div
            key={player.id}
            className={`flex items-center gap-3 p-2 rounded-lg ${
              index === 0 && player.points > 0
                ? "bg-yellow-50 border border-yellow-200"
                : "bg-muted"
            }`}
          >
            <div className="flex items-center justify-center w-6">
              {getRankIcon(index + 1)}
            </div>
            <Avatar index={player.character} size="sm" />
            <div className="flex-1 min-w-0">
              <span className="text-sm font-medium text-foreground truncate block">
                {player.name} {player.id === currentPlayerId && "(YOU)"}
              </span>
            </div>
            <span className="text-sm font-bold text-primary">
              {player.points}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
