"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { ImageOff } from "lucide-react";
import { cn } from "@/lib/utils";

/** height / width above this is treated as a portrait flyer, not a photograph. */
export const PORTRAIT_RATIO = 1.1;

export type ImageFit = "cover" | "contain";

interface SmartImageProps {
  /** null/undefined or a failed load renders the designed fallback. */
  src: string | null | undefined;
  alt: string;
  /** Shown inside the fallback so a broken image is still identifiable. */
  title?: string;
  sizes: string;
  className?: string;
  priority?: boolean;
  /** Force a fit. Omit to choose from the image's natural proportions. */
  fit?: ImageFit;
  /** Server-measured size, when known, avoids waiting for the load event. */
  width?: number | null;
  height?: number | null;
  /** Called once the real fit is known (used by galleries to size their frame). */
  onFit?: (fit: ImageFit) => void;
}

function fitFor(w: number, h: number): ImageFit {
  return w > 0 && h / w > PORTRAIT_RATIO ? "contain" : "cover";
}

/**
 * next/image that fills its (relatively positioned, aspect-ratio'd) parent.
 * Portrait flyers use object-contain so nothing is cropped or stretched;
 * ordinary photos keep object-cover. The parent supplies the neutral
 * background and the fixed aspect ratio, so nothing shifts as images load.
 */
export function SmartImage({
  src,
  alt,
  title,
  sizes,
  className,
  priority,
  fit: forcedFit,
  width,
  height,
  onFit,
}: SmartImageProps) {
  const known = width && height ? fitFor(width, height) : undefined;
  const [detected, setDetected] = useState<ImageFit | undefined>(known);
  const [failed, setFailed] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);
  const fit = forcedFit ?? detected;

  const measure = useCallback(
    (img: HTMLImageElement) => {
      if (!img.naturalWidth) return;
      const next = fitFor(img.naturalWidth, img.naturalHeight);
      setDetected(next);
      onFit?.(next);
    },
    [onFit]
  );

  // Images that finished loading before hydration never fire onLoad.
  useEffect(() => {
    const img = imgRef.current;
    if (img?.complete && img.naturalWidth) measure(img);
    else if (img?.complete) setFailed(true);
  }, [measure, src]);

  if (!src || failed) {
    return (
      <div
        role="img"
        aria-label={alt}
        className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-surface p-4 text-center"
      >
        <ImageOff size={22} className="text-muted" aria-hidden />
        {title && (
          <span className="font-display text-sm text-ink line-clamp-3">{title}</span>
        )}
      </div>
    );
  }

  return (
    <Image
      ref={imgRef}
      src={src}
      alt={alt}
      fill
      sizes={sizes}
      priority={priority}
      data-fit={fit}
      onLoad={(e) => measure(e.currentTarget)}
      onError={() => setFailed(true)}
      className={cn(
        fit === "contain" ? "object-contain" : "object-cover",
        // Hidden until the fit is known so a flyer never flashes cropped.
        fit ? "opacity-100" : "opacity-0",
        className
      )}
    />
  );
}
