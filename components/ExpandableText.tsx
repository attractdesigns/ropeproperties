"use client";

import { useId, useState } from "react";
import { cn } from "@/lib/utils";

interface ExpandableTextProps {
  text: string;
  className?: string;
  /** Below this length there is nothing worth collapsing. */
  threshold?: number;
}

/**
 * Collapsed to three lines on phones with an accessible "Read more" toggle;
 * always shown in full from md up, where there is room.
 */
export function ExpandableText({ text, className, threshold = 180 }: ExpandableTextProps) {
  const [open, setOpen] = useState(false);
  const id = useId();
  const collapsible = text.length > threshold;

  return (
    <div className={className}>
      <p
        id={id}
        className={cn("whitespace-pre-line", collapsible && !open && "line-clamp-3 md:line-clamp-none")}
      >
        {text}
      </p>
      {collapsible && (
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          aria-expanded={open}
          aria-controls={id}
          className="mt-1 inline-flex min-h-11 items-center text-sm font-medium text-accent hover:text-accent-deep md:hidden"
        >
          {open ? "Show less" : "Read more"}
        </button>
      )}
    </div>
  );
}
