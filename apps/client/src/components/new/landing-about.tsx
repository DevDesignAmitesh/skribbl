import Image from "next/image";
import Link from "next/link";

export const LandingAbout = () => {
  return (
    <div className="w-full bg-[#0C2D95] p-2 flex flex-col justify-center items-start lg:items-center text-neutral-100 text-sm">
      <div className="flex justify-start items-center gap-18 w-full mb-4">
        <Image
          unoptimized
          src={"/about.gif"}
          alt="logo"
          width={30}
          height={30}
        />

        <h1 className="text-2xl font-semibold">About</h1>
      </div>

      <p>
        <Link href={"/"} className="font-semibold">
          skribbl.io
        </Link>{" "}
        is a free online multiplayer drawing and guessing pictionary game.
      </p>

      <p className="mt-3">
        A normal game consists of a few rounds, where every round a player has
        to draw their chosen word and others have to guess it to gain points!
      </p>

      <p className="mt-3">
        The person with the most points at the end of the game, will then be
        crowned as the winner! Have fun!
      </p>
    </div>
  );
};
