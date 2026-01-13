import { useState } from "react";
import { cn } from "@/lib/utils";

interface WordSelectionProps {
  words: string[];
  onSelectWord: (word: string) => void;
}

export const WordSelection = ({ words, onSelectWord }: WordSelectionProps) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  return (
    <div className="bg-card border border-border rounded-lg h-screen flex flex-col items-center justify-center p-8">
      <h2 className="text-2xl font-bold text-foreground mb-2">Choose a Word</h2>
      <p className="text-muted-foreground mb-8">Select one word to draw</p>

      <div className="flex gap-6">
        {words.map((word, index) => (
          <button
            key={index}
            onClick={() => onSelectWord(word)}
            onMouseEnter={() => setHoveredIndex(index)}
            onMouseLeave={() => setHoveredIndex(null)}
            className={cn(
              "w-48 h-32 rounded-lg border-2 flex items-center justify-center",
              "text-xl font-semibold transition-all duration-200",
              "bg-background hover:bg-accent",
              hoveredIndex === index
                ? "border-primary scale-105 shadow-lg"
                : "border-border"
            )}
          >
            {word}
          </button>
        ))}
      </div>

      <p className="text-sm text-muted-foreground mt-8">
        Click on a word to start drawing
      </p>
    </div>
  );
};
