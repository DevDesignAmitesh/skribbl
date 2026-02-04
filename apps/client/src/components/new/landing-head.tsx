import Image from "next/image";

export const LandingHead = () => {
  return (
    <div className="flex flex-col justify-center items-center gap-4">
      <Image
        unoptimized
        src={"/logo.gif"}
        alt="logo"
        width={100}
        height={100}
        className="w-md"
        loading="eager"
      />
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
