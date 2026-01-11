import { cn } from "@/lib/utils";

interface AvatarSelectorProps {
  selectedIndex: number;
  onSelect: (index: number) => void;
  size?: "sm" | "md";
}

// Simple geometric face avatars with different colors
const avatars = [
  { bg: "hsl(0 70% 60%)", expression: "happy" }, // Red
  { bg: "hsl(210 70% 55%)", expression: "cool" }, // Blue
  { bg: "hsl(120 50% 45%)", expression: "wink" }, // Green
  { bg: "hsl(45 90% 55%)", expression: "surprised" }, // Yellow
  { bg: "hsl(280 60% 55%)", expression: "sleepy" }, // Purple
];

export const Avatar = ({
  index,
  size = "md",
}: {
  index: number;
  size?: "sm" | "md";
}) => {
  const avatar = avatars[index] || avatars[0];
  const sizeClass = size === "sm" ? "w-8 h-8" : "w-12 h-12";

  return (
    <svg viewBox="0 0 40 40" className={sizeClass}>
      <circle
        cx="20"
        cy="20"
        r="18"
        fill={avatar.bg}
        stroke="hsl(var(--border))"
        strokeWidth="2"
      />
      {/* Eyes */}
      {avatar.expression === "cool" ? (
        <>
          <rect
            x="10"
            y="15"
            width="8"
            height="3"
            rx="1"
            fill="hsl(var(--foreground))"
          />
          <rect
            x="22"
            y="15"
            width="8"
            height="3"
            rx="1"
            fill="hsl(var(--foreground))"
          />
        </>
      ) : avatar.expression === "wink" ? (
        <>
          <circle cx="14" cy="16" r="2" fill="hsl(var(--foreground))" />
          <path
            d="M22 14 Q26 16 22 18"
            stroke="hsl(var(--foreground))"
            strokeWidth="2"
            fill="none"
          />
        </>
      ) : avatar.expression === "surprised" ? (
        <>
          <circle cx="14" cy="16" r="3" fill="hsl(var(--foreground))" />
          <circle cx="26" cy="16" r="3" fill="hsl(var(--foreground))" />
        </>
      ) : avatar.expression === "sleepy" ? (
        <>
          <path
            d="M10 16 L18 16"
            stroke="hsl(var(--foreground))"
            strokeWidth="2"
          />
          <path
            d="M22 16 L30 16"
            stroke="hsl(var(--foreground))"
            strokeWidth="2"
          />
        </>
      ) : (
        <>
          <circle cx="14" cy="16" r="2" fill="hsl(var(--foreground))" />
          <circle cx="26" cy="16" r="2" fill="hsl(var(--foreground))" />
        </>
      )}
      {/* Mouth */}
      {avatar.expression === "surprised" ? (
        <circle cx="20" cy="28" r="4" fill="hsl(var(--foreground))" />
      ) : avatar.expression === "sleepy" ? (
        <path
          d="M16 28 L24 28"
          stroke="hsl(var(--foreground))"
          strokeWidth="2"
        />
      ) : (
        <path
          d="M14 26 Q20 32 26 26"
          stroke="hsl(var(--foreground))"
          strokeWidth="2"
          fill="none"
        />
      )}
    </svg>
  );
};

export const AvatarSelector = ({
  selectedIndex,
  onSelect,
  size = "md",
}: AvatarSelectorProps) => {
  return (
    <div className="flex gap-2">
      {avatars.map((_, index) => (
        <button
          key={index}
          onClick={() => onSelect(index)}
          className={cn(
            "rounded-full p-1 transition-all",
            selectedIndex === index
              ? "ring-2 ring-primary ring-offset-2"
              : "hover:ring-2 hover:ring-muted-foreground hover:ring-offset-1"
          )}
        >
          <Avatar index={index} size={size} />
        </button>
      ))}
    </div>
  );
};
