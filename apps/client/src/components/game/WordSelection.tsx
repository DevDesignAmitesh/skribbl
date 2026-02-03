// TODO: make sure that random words are not repeating itself...

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
      <div className="bg-card border border-border rounded-lg h-screen flex flex-col items-center justify-center p-8">
        <h2 className="text-2xl font-bold text-foreground mb-2">
          Choose a Word
        </h2>
        <p className="text-muted-foreground mb-8">Select one word to draw</p>

        <div className="flex gap-6">
          {randomWords.map((word, index) => (
            <button
              key={index}
              onClick={() => handleSelectWord(word)}
              className={cn(
                "w-48 h-32 rounded-lg border-2 flex items-center justify-center",
                "text-xl font-semibold transition-all duration-200",
                "bg-background hover:bg-accent",
                "hover:border-primary hover:scale-105 hover:shadow-lg",
                "hover:border-border",
              )}
            >
              {word}
            </button>
          ))}
        </div>

        <p className="text-sm text-muted-foreground mt-8">
          Auto-selects in{" "}
          <span className="text-foreground font-semibold">{timeleft}s</span> if
          no choice is made
        </p>
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

    if (arr.length === 3) break;
    arr.push(element);
  }

  return arr;
}
