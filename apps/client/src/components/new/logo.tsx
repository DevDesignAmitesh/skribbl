import Image from "next/image";

export const Logo = ({ size }: { size: number }) => {
  return (
    <Image
      unoptimized
      src={"/logo.gif"}
      alt="logo"
      width={size}
      height={size}
      className="w-xs"
      loading="eager"
    />
  );
};
