import Image from "next/image";

export const Logo = ({ width }: { width: string }) => {
  return (
    <div className="flex md:gap-4 gap-2 items-center justify-center md:flex-row flex-col">
      <p className="md:text-8xl text-7xl font-semibold">
        <span className="text-[#ED2B34] bordered-text">N</span>
        <span className="text-[#FF7B00] bordered-text">o</span>
        <span className="text-[#FFFF1B] bordered-text">t</span>
      </p>
      <Image
        unoptimized
        src={"/logo.gif"}
        alt="logo"
        width={100}
        height={100}
        className={width}
        loading="eager"
      />
    </div>
  );
};
