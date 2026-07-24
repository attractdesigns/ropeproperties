import { cn } from "@/lib/utils";
import { WORDMARK_TAGLINE } from "@/lib/site";

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
        style={{ color, fontSize: "1.4rem", lineHeight: 1 }}
      >
        ROPE
      </span>
      {showTagline && (
        // Sized so the longer "REALTOR OPEOLUWA" sub-line still sits flush
        // under ROPE rather than overhanging it.
        <span
          className="font-sans tracking-[0.05em] uppercase mt-1 whitespace-nowrap"
          style={{ color: taglineColor, fontSize: "0.45rem", lineHeight: 1 }}
        >
          {WORDMARK_TAGLINE}
        </span>
      )}
    </span>
  );
}