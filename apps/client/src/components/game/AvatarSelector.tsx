import { cn } from "@/lib/utils";

interface AvatarSelectorProps {
  selectedIndex: number;
  onSelect: (index: number) => void;
  size?: "sm" | "md";
}

type Expression = "normal" | "cool" | "wink" | "surprised" | "sleepy";

type AvatarType = {
  bg: string;
  expression: Expression;
};

export const avatars: AvatarType[] = [
  { bg: "#ef4444", expression: "normal" },
  { bg: "#3b82f6", expression: "cool" },
  { bg: "#22c55e", expression: "wink" },
  { bg: "#facc15", expression: "surprised" },
  { bg: "#a855f7", expression: "cool" },
];

export const Avatar = ({
  index,
  size = "md",
}: {
  index: number;
  size?: "sm" | "md";
}) => {
  const avatar = avatars[index] || avatars[0];
  const exp: Expression = avatar.expression ?? "normal";

  const sizeClass = size === "sm" ? "w-8 h-8" : "w-12 h-12";

  const fg = "#0f172a"; // dark slate (eyes + mouth)
  const border = "#e5e7eb"; // light gray border

  return (
    <svg viewBox="0 0 40 40" className={sizeClass}>
      {/* background */}
      <circle
        cx="20"
        cy="20"
        r="18"
        fill={avatar.bg}
        stroke={border}
        strokeWidth="2"
      />

      {/* ================= EYES ================= */}

      {exp === "cool" && (
        <>
          <rect x="9" y="14" width="10" height="4" rx="2" fill={fg} />
          <rect x="21" y="14" width="10" height="4" rx="2" fill={fg} />
          <rect x="19" y="15.5" width="2" height="1" fill={fg} />
        </>
      )}

      {exp === "wink" && (
        <>
          <circle cx="14" cy="16" r="2" fill={fg} />
          <path
            d="M22 16 Q26 14 30 16"
            stroke={fg}
            strokeWidth="2"
            fill="none"
            strokeLinecap="round"
          />
        </>
      )}

      {exp === "surprised" && (
        <>
          <circle cx="14" cy="16" r="3" fill={fg} />
          <circle cx="26" cy="16" r="3" fill={fg} />
        </>
      )}

      {exp === "sleepy" && (
        <>
          <path
            d="M10 16 Q14 18 18 16"
            stroke={fg}
            strokeWidth="2"
            fill="none"
            strokeLinecap="round"
          />
          <path
            d="M22 16 Q26 18 30 16"
            stroke={fg}
            strokeWidth="2"
            fill="none"
            strokeLinecap="round"
          />
        </>
      )}

      {exp === "normal" && (
        <>
          <circle cx="14" cy="16" r="2" fill={fg} />
          <circle cx="26" cy="16" r="2" fill={fg} />
        </>
      )}

      {/* ================= MOUTH ================= */}

      {exp === "surprised" && <circle cx="20" cy="27" r="3.5" fill={fg} />}

      {exp === "sleepy" && (
        <path
          d="M16 28 Q20 30 24 28"
          stroke={fg}
          strokeWidth="2"
          fill="none"
          strokeLinecap="round"
        />
      )}

      {exp === "cool" && (
        <path d="M15 27 Q20 31 25 27" stroke={fg} strokeWidth="2" fill="none" />
      )}

      {exp === "wink" && (
        <path d="M14 27 Q20 29 26 27" stroke={fg} strokeWidth="2" fill="none" />
      )}

      {exp === "normal" && (
        <path d="M14 26 Q20 32 26 26" stroke={fg} strokeWidth="2" fill="none" />
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
