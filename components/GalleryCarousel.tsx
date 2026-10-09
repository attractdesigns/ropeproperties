"use client";

import { useState, useCallback, useEffect, useMemo, useRef } from "react";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import { ChevronLeft, ChevronRight, Expand, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { getStorageUrl } from "@/lib/storage";
import { SmartImage, PORTRAIT_RATIO, type ImageFit } from "./SmartImage";

export interface GalleryImage {
  storage_path: string;
  alt: string | null;
  /** Server-measured pixel size; lets the frame be right on first paint. */
  width?: number | null;
  height?: number | null;
}

interface GalleryCarouselProps {
  images: GalleryImage[];
  /** Listing title, used for alt text and the broken-image fallback. */
  title: string;
}

const ctrl =
  "absolute inline-flex h-11 w-11 items-center justify-center bg-white/85 text-ink transition-colors hover:bg-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent";
const lightboxCtrl =
  "absolute inline-flex h-11 w-11 items-center justify-center rounded-full bg-white/15 text-white hover:bg-white/25 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white";

export function GalleryCarousel({ images, title }: GalleryCarouselProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  // Portrait flyers are read, not admired: they get a portrait frame on phones
  // and no auto-advancing. The first image decides, from server-measured size
  // when available (no layout shift) or from the load event otherwise.
  const first = images[0];
  const serverFit: ImageFit | undefined =
    first?.width && first?.height
      ? first.height / first.width > PORTRAIT_RATIO
        ? "contain"
        : "cover"
      : undefined;
  const [measuredFit, setMeasuredFit] = useState<ImageFit | undefined>();
  const portrait = (serverFit ?? measuredFit) === "contain";
  const onFirstFit = useCallback((fit: ImageFit) => setMeasuredFit(fit), []);

  const [motionOk, setMotionOk] = useState(false);
  useEffect(() => {
    setMotionOk(!window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  }, []);

  const plugins = useMemo(
    () => (motionOk && !portrait ? [Autoplay({ delay: 5000, stopOnInteraction: true })] : []),
    [motionOk, portrait]
  );
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: images.length > 1 }, plugins);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  const scrollTo = useCallback((i: number) => emblaApi?.scrollTo(i), [emblaApi]);
  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);

  // Without this the thumbnail highlight and lightbox stay pinned to slide 0.
  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on("select", onSelect).on("reInit", onSelect);
    return () => {
      emblaApi.off("select", onSelect).off("reInit", onSelect);
    };
  }, [emblaApi, onSelect]);

  // Keep the active thumbnail in view by scrolling the strip itself, never the page.
  const stripRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const strip = stripRef.current;
    const thumb = strip?.children[selectedIndex] as HTMLElement | undefined;
    if (!strip || !thumb) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    strip.scrollTo({
      left: thumb.offsetLeft - (strip.clientWidth - thumb.clientWidth) / 2,
      behavior: reduce ? "auto" : "smooth",
    });
  }, [selectedIndex]);

  const expandRef = useRef<HTMLButtonElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    if (!lightboxOpen) return;
    const opener = expandRef.current;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setLightboxOpen(false);
      if (e.key === "ArrowLeft") scrollPrev();
      if (e.key === "ArrowRight") scrollNext();
    };
    document.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
      opener?.focus();
    };
  }, [lightboxOpen, scrollPrev, scrollNext]);

  const count = images.length;
  const altFor = (image: GalleryImage, i: number) =>
    image.alt?.trim() || (count > 1 ? `${title} — image ${i + 1} of ${count}` : title);

  if (count === 0) {
    return (
      <div className="aspect-[16/10] bg-surface border border-line flex items-center justify-center">
        <p className="text-muted">No images available</p>
      </div>
    );
  }

  // Phones get a tall frame for flyers; md+ keeps the original 16:10 frame
  // (the flyer is contained inside it) so the desktop layout is unchanged.
  const frame = portrait
    ? "aspect-[4/5] max-h-[75vh] md:aspect-[16/10] md:max-h-none"
    : "aspect-[16/10]";
  const slideSizes = portrait
    ? "(max-width: 768px) 100vw, 640px"
    : "(max-width: 768px) 100vw, 1000px";

  return (
    <>
      <div className="relative">
        <div
          className="embla"
          ref={emblaRef}
          role="region"
          aria-roledescription="carousel"
          aria-label={`${title} photos`}
        >
          <div className="embla__container">
            {images.map((image, i) => (
              <div
                key={i}
                className={cn("embla__slide relative bg-surface", frame)}
                role="group"
                aria-roledescription="slide"
                aria-label={`${i + 1} of ${count}`}
              >
                <SmartImage
                  src={getStorageUrl(image.storage_path)}
                  alt={altFor(image, i)}
                  title={title}
                  sizes={slideSizes}
                  priority={i === 0}
                  width={image.width}
                  height={image.height}
                  fit={portrait ? "contain" : undefined}
                  onFit={i === 0 ? onFirstFit : undefined}
                />
              </div>
            ))}
          </div>
        </div>

        {count > 1 && (
          <>
            <button
              type="button"
              onClick={scrollPrev}
              className={cn(ctrl, "left-2 top-1/2 -translate-y-1/2")}
              aria-label="Previous image"
            >
              <ChevronLeft size={20} aria-hidden />
            </button>
            <button
              type="button"
              onClick={scrollNext}
              className={cn(ctrl, "right-2 top-1/2 -translate-y-1/2")}
              aria-label="Next image"
            >
              <ChevronRight size={20} aria-hidden />
            </button>
            <p
              aria-live="polite"
              className="pointer-events-none absolute bottom-3 left-3 rounded-full bg-black/60 px-3 py-1 text-xs font-medium text-white backdrop-blur-sm"
            >
              {selectedIndex + 1} of {count}
            </p>
          </>
        )}
        <button
          ref={expandRef}
          type="button"
          onClick={() => setLightboxOpen(true)}
          className={cn(ctrl, "right-2 top-2")}
          aria-label="Expand image"
          aria-haspopup="dialog"
        >
          <Expand size={18} aria-hidden />
        </button>
      </div>

      {/* Thumbnail strip — swipeable, scrollbar hidden */}
      {count > 1 && (
        <div
          ref={stripRef}
          className="no-scrollbar mt-3 flex snap-x gap-2 overflow-x-auto overscroll-x-contain"
        >
          {images.map((image, i) => (
            <button
              key={i}
              type="button"
              onClick={() => scrollTo(i)}
              aria-label={`Show image ${i + 1} of ${count}`}
              aria-current={i === selectedIndex}
              className={cn(
                "relative shrink-0 snap-start border-2 bg-surface transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent",
                portrait ? "h-20 w-16" : "h-16 w-20",
                i === selectedIndex ? "border-accent" : "border-transparent opacity-60 hover:opacity-100"
              )}
            >
              <SmartImage
                src={getStorageUrl(image.storage_path)}
                alt=""
                sizes="80px"
                width={image.width}
                height={image.height}
                fit={portrait ? "contain" : undefined}
              />
            </button>
          ))}
        </div>
      )}

      {lightboxOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`${title} — image ${selectedIndex + 1} of ${count}`}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 p-4"
          onClick={() => setLightboxOpen(false)}
        >
          <button
            ref={closeRef}
            type="button"
            className={cn(lightboxCtrl, "right-3 top-3")}
            onClick={() => setLightboxOpen(false)}
            aria-label="Close expanded image"
          >
            <X size={22} aria-hidden />
          </button>
          <div className="relative h-[80vh] w-full max-w-5xl" onClick={(e) => e.stopPropagation()}>
            <SmartImage
              src={getStorageUrl(images[selectedIndex].storage_path)}
              alt={altFor(images[selectedIndex], selectedIndex)}
              title={title}
              sizes="100vw"
              fit="contain"
            />
          </div>
          {count > 1 && (
            <>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  scrollPrev();
                }}
                className={cn(lightboxCtrl, "left-2 top-1/2 -translate-y-1/2")}
                aria-label="Previous image"
              >
                <ChevronLeft size={22} aria-hidden />
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  scrollNext();
                }}
                className={cn(lightboxCtrl, "right-2 top-1/2 -translate-y-1/2")}
                aria-label="Next image"
              >
                <ChevronRight size={22} aria-hidden />
              </button>
              <p className="pointer-events-none absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full bg-black/60 px-3 py-1 text-xs text-white">
                {selectedIndex + 1} of {count}
              </p>
            </>
          )}
        </div>
      )}
    </>
  );
}
