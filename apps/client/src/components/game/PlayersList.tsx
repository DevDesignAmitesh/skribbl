import { Player } from "./types";
import { Avatar } from "./AvatarSelector";

interface PlayersListProps {
  players: Player[];
}

export const PlayersList = ({ players }: PlayersListProps) => {
  return (
    <div className="bg-card border border-border rounded-lg h-full flex flex-col">
      <div className="p-3 border-b border-border">
        <h2 className="font-semibold text-foreground">
          Players ({players.length})
        </h2>
      </div>
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {players.map((player) => (
          <div
            key={player.id}
            className="flex items-center gap-3 p-2 bg-muted rounded-lg"
          >
            <Avatar index={player.avatarIndex} size="sm" />
            <span className="text-sm font-medium text-foreground truncate">
              {player.name}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
