import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  variant?: "dark" | "light";
  showTagline?: boolean;
}

export function Logo({ className, variant = "dark", showTagline = true }: LogoProps) {
  const color = variant === "light" ? "#ffffff" : "#17191c";
  const taglineColor = variant === "light" ? "rgba(255,255,255,0.7)" : "#5f656d";

  return (
    <span className={cn("inline-flex flex-col leading-none", className)}>
      <span
        className="font-display tracking-[0.15em] font-semibold"
        style={{ color, fontSize: "1.25rem", lineHeight: 1 }}
      >
        ROPE
      </span>
      {showTagline && (
        <span
          className="font-sans tracking-[0.3em] uppercase mt-0.5"
          style={{ color: taglineColor, fontSize: "0.5rem", lineHeight: 1 }}
        >
          PROPERTIES
        </span>
      )}
    </span>
  );
}