import { HalfWord } from "@repo/common/common";

// for deployed one
// export const WS_URL = "wss://skribbl-be.amitesh.work";

// for localhost
export const WS_URL = "ws://localhost:8080";

// for intra-net
// export const WS_URL = "https://xfhpm9tf-8080.inc1.devtunnels.ms/";

export const random_words = [
  "cat, dog, house, car, sun, ninja, robot, dragon, airplane, skateboard, volcano",
  "apple, ball, hat, book, chair, phone, pirate, wizard, unicorn, ghost, lighthouse",
  "tree, fish, cloud, cake, cup, key, dinosaur, alien, superhero, snowman, waterfall",
];

export const MAX_CHARACTER = 9;
export const characters: Record<number, string> = {
  1: "/char/one.png",
  2: "/char/two.png",
  3: "/char/three.png",
  4: "/char/four.png",
  5: "/char/five.png",
  6: "/char/six.png",
  7: "/char/seven.png",
  8: "/char/eight.png",
  9: "/char/nine.png",
};

export const languages = [
  { value: "en", label: "English" },
  { value: "nan", label: "Coming soon.." },
  // { value: "es", label: "Spanish" },
  // { value: "fr", label: "French" },
  // { value: "de", label: "German" },
  // { value: "pt", label: "Portuguese" },
];

export const getContext = (
  canvasRef: React.RefObject<HTMLCanvasElement | null>,
) => {
  const canvas = canvasRef.current;
  if (!canvas) return null;
  return canvas.getContext("2d");
};

export const getCanvasCoordinates = (
  e: React.MouseEvent<HTMLCanvasElement>,
  canvasRef: React.RefObject<HTMLCanvasElement | null>,
) => {
  const canvas = canvasRef.current;
  if (!canvas) return { x: 0, y: 0 };

  const rect = canvas.getBoundingClientRect();
  const scaleX = canvas.width / rect.width;
  const scaleY = canvas.height / rect.height;

  return {
    x: (e.clientX - rect.left) * scaleX,
    y: (e.clientY - rect.top) * scaleY,
  };
};

export const formatHalfWord = (word: HalfWord[], totalLength: number[]) => {
  return totalLength.map((nm, groupIdx) => {
    const arr = Array.from({ length: nm });

    return (
      <div key={groupIdx} className="inline-block mr-4">
        {arr.map((_, idx) => {
          const halfWord = word.find((wr) => wr.idx == idx);
          if (halfWord) {
            return (
              <span key={idx} className="mr-1">
                {halfWord.elm}
              </span>
            );
          }
          return (
            <span key={idx} className="mr-1">
              _
            </span>
          );
        })}
      </div>
    );
  });
};

export const formatHiddenWord = (totalLength: number[]) => {
  return totalLength.map((nm, groupIdx) => {
    const arr = Array.from({ length: nm });

    return (
      <div key={groupIdx} className="inline-block mr-4">
        {arr.map((_, idx) => (
          <span key={idx} className="mr-1">
            _
          </span>
        ))}
      </div>
    );
  });
};

export const colors = [
  "#000000", // Black
  "#FFFFFF", // White
  "#EF4444", // Red
  "#F97316", // Orange
  "#EAB308", // Yellow
  "#22C55E", // Green
  "#3B82F6", // Blue
  "#8B5CF6", // Purple
  "#EC4899", // Pink
  "#78716C", // Brown
];

export const strokeWidths = [
  { value: 2, label: "Thin" },
  { value: 6, label: "Medium" },
  { value: 12, label: "Thick" },
];
