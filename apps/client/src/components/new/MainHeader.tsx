import Image from "next/image";
import { Logo } from "./logo";

export const MainHeader = () => {
  return (
    <header className="w-full flex flex-col justify-center items-start gap-2 text-neutral-800">
      <Logo width="w-xs" />
      <div className="w-full flex justify-between items-center bg-white pr-2">
        {/* timer and round */}
        <div className="flex items-center gap-4">
          <div className="relative flex items-center justify-center">
            <Image
              unoptimized
              src="/clock.gif"
              alt="timer"
              width={40}
              height={40}
              className="w-16 h-auto"
              loading="eager"
            />
            {/* timer number */}
            <span className="absolute z-20 text-lg font-semibold text-black drop-shadow-md">
              49
            </span>
          </div>

          <p className="text-xl font-semibold">Round 1 of 3</p>
        </div>

        {/* room status */}
        <p className="text-sm font-bold text-neutral-700">WAITING</p>

        {/* setting icon (MOCK) */}
        <Image
          unoptimized
          src={"/settings.gif"}
          alt="logo"
          width={70}
          height={70}
          className="w-auto h-auto"
          loading="eager"
        />
      </div>
    </header>
  );
};
