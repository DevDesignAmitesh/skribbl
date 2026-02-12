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
        <div className="w-full h-full flex flex-col items-center justify-center text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-accent mb-3">
            Choose a Word
          </h2>

          <p className="text-accent mb-10 text-lg">
            Select one word to draw
          </p>

          <div className="flex flex-col md:flex-row gap-6">
            {randomWords.map((word, index) => (
              <button
                key={index}
                onClick={() => handleSelectWord(word)}
                className={cn(
                  "w-40 h-20 rounded-xl border-2 flex items-center justify-center",
                  "text-lg font-semibold transition-all duration-200",
                  "bg-background hover:bg-accent",
                  "hover:border-primary hover:scale-105 hover:shadow-2xl",
                  "active:scale-95",
                )}
              >
                {word}
              </button>
            ))}
          </div>

          <p className="text-base text-accent-foreground mt-10">
            Auto-selects in{" "}
            <span className="text-accent font-bold text-lg">
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
