import { useRestContext } from "@/context/rest";
import { characters } from "@/lib/lib";
import Image from "next/image";

export const LivePlayers = () => {
  const { room, player } = useRestContext();

  const sortedPlayers = room.users.sort((a, b) => b.points - a.points);
  const userId = player.id;

  console.log("player ", player);
  console.log("sortedPlayers ", sortedPlayers);

  return (
    <div className="h-full w-full flex flex-col justify-start items-center gap-2">
      {sortedPlayers.map((pyr, idx) => {
        const isYou = pyr.id === userId;
        const isAdmin = pyr.type === "admin";
        return (
          <div
            key={pyr.id}
            className="flex justify-between items-start bg-white w-full p-1"
          >
            <div className="flex flex-col justify-center items-center">
              <p className="font-semibold">#{idx + 1}</p>
              {isAdmin && (
                <Image
                  unoptimized
                  src={"/owner.gif"}
                  alt="avatar"
                  width={40}
                  height={40}
                  className="w-6 h-auto"
                  loading="eager"
                />
              )}
            </div>
            <div className="flex flex-col justify-center items-center font-semibold text-sm">
              <p className={`${isYou && "text-blue-500"}`}>
                {pyr.name} {isYou && "(YOU)"}
              </p>
              <p className="text-xs">{pyr.points} points</p>
            </div>
            <Image
              src={characters[pyr.character]}
              alt="avatar"
              width={34}
              height={34}
              className="w-auto h-auto"
              loading="eager"
            />
          </div>
        );
      })}
    </div>
  );
};
