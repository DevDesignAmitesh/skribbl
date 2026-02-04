import Image from "next/image";
import { useEffect, useState } from "react";

interface HowToPlay {
  title: string;
  gif: string;
}

const stepData: Record<number, HowToPlay> = {
  1: {
    gif: "/steps/step1.gif",
    title: "When it's your turn, choose a word you want to draw!",
  },
  2: {
    gif: "/steps/step2.gif",
    title: "Try to draw your choosen word! No spelling!",
  },
  3: {
    gif: "/steps/step3.gif",
    title: "Let other players try to guess your drawn word!",
  },
  4: {
    gif: "/steps/step4.gif",
    title:
      "When it's not your turn, try to guess what other players are drawing!",
  },
  5: {
    gif: "/steps/step5.gif",
    title: "Score the most points and be crowned the winner at the end!",
  },
};

const MAX_STEP = 5;

export const LandingHowToPlay = () => {
  const [step, setStep] = useState<number>(1);

  useEffect(() => {
    setInterval(() => {
      setStep((prev) => {
        if (prev === MAX_STEP) return 1;
        return prev + 1;
      });
    }, 1500);
  }, []);

  const recentStep = stepData[step];

  return (
    <div className="w-full bg-[#0C2D95] py-3 px-2 flex flex-col justify-center items-start lg:items-center text-neutral-100">
      <div className="flex justify-start items-center gap-16 w-full mb-3">
        <Image unoptimized src={"/how.gif"} alt="logo" width={30} height={30} />

        <h1 className="text-2xl font-semibold">How to play</h1>
      </div>
      <div className="flex flex-col justify-center items-center mt-3">
        <Image
          src={recentStep.gif}
          alt={recentStep.title}
          width={200}
          height={200}
          className="h-auto w-auto"
        />
        <p className="text-center text-sm">{recentStep.title}</p>
        <div className="flex justify-center items-center gap-2 mt-6">
          {[1, 2, 3, 4, 5].map((val) => {
            if (val === step) {
              return (
                <p key={val} className="h-3 w-3 rounded-full bg-neutral-100" />
              );
            }

            return (
              <p
                key={val}
                className="h-3 w-3 rounded-full border border-neutral-100"
              />
            );
          })}
        </div>
      </div>
    </div>
  );
};
