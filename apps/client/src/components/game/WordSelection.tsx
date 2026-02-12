import { cn } from "@/lib/utils";
import { useEffect, useRef, useState } from "react";
import Sound from "react-sound";

interface WordSelectionProps {
  words: string[];
  onSelectWord: (word: string) => void;
}

export const WordSelection = ({ words, onSelectWord }: WordSelectionProps) => {
  const [randomWords, setRandomWords] = useState<string[]>([]);

  const hasSelectedRef = useRef<boolean>(false);
  const [timeleft, setTimeleft] = useState(10);

  useEffect(() => {
    if (hasSelectedRef.current) return;

    const interval = setInterval(() => {
      if (timeleft <= 0) return;
      setTimeleft((prev) => {
        if (prev <= 1) {
          if (!hasSelectedRef.current && randomWords[1]) {
            hasSelectedRef.current = true;
            onSelectWord(randomWords[1]);
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [randomWords, onSelectWord]);

  // generate words ONCE
  useEffect(() => {
    setRandomWords(getRandomWords(words));
  }, [words]);

  const handleSelectWord = (word: string) => {
    if (hasSelectedRef.current) return;
    hasSelectedRef.current = true;
    onSelectWord(word);
  };

  return (
    <>
      <div className="w-full h-full bg-black/80 backdrop-blur-sm flex items-center justify-center">
        <div className="w-full h-full flex flex-col items-center justify-center text-center md:p-0 p-2">
          <h2 className="text-xl md:text-4xl font-bold text-accent md:mb-3 mb-1">
            Choose a Word
          </h2>

          <p className="text-accent md:mb-10 mb-4 md:text-lg text-sm">
            Select one word to draw
          </p>

          <div className="flex flex-col md:flex-row md:gap-6 gap-3">
            {randomWords.map((word, index) => (
              <button
                key={index}
                onClick={() => handleSelectWord(word)}
                className={cn(
                  "md:w-40 w-20 md:h-20 h-10 rounded-xl border-2 flex items-center justify-center",
                  "md:text-lg text-sm font-semibold transition-all duration-200",
                  "bg-background hover:bg-accent",
                  "hover:scale-105",
                )}
              >
                {word}
              </button>
            ))}
          </div>

          <p className="md:text-base text-sm text-accent-foreground md:mt-10 mt-5">
            Auto-selects in{" "}
            <span className="text-accent font-bold md:text-lg text-base">
              {timeleft}s
            </span>{" "}
            if no choice is made
          </p>
        </div>
      </div>

      <Sound url="/timer.mp3" playStatus="PLAYING" />
    </>
  );
};

function getRandomWords(words: string[]): string[] {
  const arr: string[] = [];

  for (let i = 0; i < words.length; i++) {
    const randomIndex = Math.floor(Math.random() * words.length)!;
    const element = words[randomIndex];
    if (arr.includes(element)) continue;
    if (arr.length === 3) break;
    arr.push(element);
  }

  return arr;
}
