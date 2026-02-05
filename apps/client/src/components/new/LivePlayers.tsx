import { characters } from "@/lib/lib";
import Image from "next/image";

const players = [
  {
    name: "hello",
    id: "1",
    points: 20,
    character: 1,
    type: "member",
  },
  {
    name: "choco",
    id: "2",
    points: 40,
    character: 3,
    type: "admin",
  },
  {
    name: "nana",
    id: "3",
    points: 60,
    character: 5,
    type: "member",
  },
];

export const LivePlayers = () => {
  const sortedPlayers = players; // some logic according to points
  const userId = "2"; // will take from the props
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
