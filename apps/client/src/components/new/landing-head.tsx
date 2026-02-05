import Image from "next/image";
import { Logo } from "./logo";

export const LandingHead = () => {
  return (
    <div className="flex flex-col justify-center items-center gap-4">
      <Logo width="w-md" />
      <Image
        src={"/line-avatars.png"}
        alt="logo"
        width={100}
        unoptimized
        height={100}
        className="h-auto max-w-xs md:max-w-md w-auto"
        loading="eager"
      />
    </div>
  );
};
