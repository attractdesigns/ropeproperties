"use client";

import { Children, useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

/**
 * Mobile: one full card per viewport, scroll-snapped, with a "1 / N" counter,
 * dots and compact arrows. Desktop (lg+): the same children as a static grid,
 * controls hidden.
 */
export function FeaturedTrack({ children }: { children: ReactNode }) {
  const items = Children.toArray(children);
  const count = items.length;
  const ref = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(0);

  const onScroll = useCallback(() => {
    const el = ref.current;
    if (!el || count < 2) return;
    const step = (el.scrollWidth - el.clientWidth) / (count - 1);
    if (step <= 0) return;
    setIndex(Math.min(count - 1, Math.max(0, Math.round(el.scrollLeft / step))));
  }, [count]);

  useEffect(() => {
    onScroll();
  }, [onScroll]);

  const goTo = (i: number) => {
    const el = ref.current;
    if (!el) return;
    const clamped = Math.min(count - 1, Math.max(0, i));
    const step = (el.scrollWidth - el.clientWidth) / Math.max(1, count - 1);
    el.scrollTo({ left: clamped * step, behavior: "smooth" });
  };

  return (
    <>
      <div
        ref={ref}
        onScroll={onScroll}
        tabIndex={0}
        role="region"
        aria-label="Featured properties — swipe or scroll sideways"
        className="no-scrollbar mt-10 flex snap-x snap-mandatory gap-4 overflow-x-auto overscroll-x-contain pb-6 lg:mt-12 lg:grid lg:grid-cols-4 lg:items-stretch lg:gap-5 lg:overflow-visible lg:pb-0"
      >
        {items}
      </div>

      {count > 1 && (
        <div className="mt-2 flex items-center justify-between lg:hidden">
          <button
            type="button"
            onClick={() => goTo(index - 1)}
            disabled={index === 0}
            aria-label="Previous property"
            className="flex h-11 w-11 items-center justify-center rounded-full border border-white/20 text-white transition-opacity disabled:opacity-30"
          >
            <ChevronLeft size={20} aria-hidden />
          </button>

          <div className="flex flex-col items-center">
            <span
              className="text-xs tracking-[0.18em] text-white/70"
              aria-live="polite"
            >
              {index + 1} / {count}
            </span>
            <div className="flex items-center">
              {items.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => goTo(i)}
                  aria-label={`Go to property ${i + 1}`}
                  aria-current={i === index}
                  className="flex h-11 w-10 items-center justify-center"
                >
                  <span
                    className={`block h-2 rounded-full transition-all ${
                      i === index ? "w-5 bg-white" : "w-2 bg-white/35"
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>

          <button
            type="button"
            onClick={() => goTo(index + 1)}
            disabled={index === count - 1}
            aria-label="Next property"
            className="flex h-11 w-11 items-center justify-center rounded-full border border-white/20 text-white transition-opacity disabled:opacity-30"
          >
            <ChevronRight size={20} aria-hidden />
          </button>
        </div>
      )}
    </>
  );
}
