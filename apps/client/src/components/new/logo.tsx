import Image from "next/image";

export const Logo = ({ width }: { width: string }) => {
  return (
    <Image
      unoptimized
      src={"/logo.gif"}
      alt="logo"
      width={100}
      height={100}
      className={width}
      loading="eager"
    />
  );
};
