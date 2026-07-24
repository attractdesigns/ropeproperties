import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

interface SectionProps {
  children: ReactNode;
  className?: string;
  background?: "bg" | "surface";
  container?: boolean;
  id?: string;
}

export function Section({
  children,
  className,
  background = "bg",
  container = true,
  id,
}: SectionProps) {
  return (
    <section
      id={id}
      className={cn(
        background === "surface" ? "bg-surface" : "bg-bg",
        className
      )}
    >
      {container ? (
        <div className="mx-auto max-w-[1200px] px-4 sm:px-6 lg:px-8 py-16 md:py-24">
          {children}
        </div>
      ) : (
        children
      )}
    </section>
  );
}

interface SectionTitleProps {
  children: ReactNode;
  className?: string;
  align?: "left" | "center";
}

export function SectionTitle({ children, className, align = "left" }: SectionTitleProps) {
  return (
    <h2
      className={cn(
        "font-display text-3xl md:text-4xl font-medium text-ink",
        align === "center" && "text-center",
        className
      )}
    >
      {children}
    </h2>
  );
}