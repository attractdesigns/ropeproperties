"use client";

import { useState, useCallback, useEffect } from "react";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import Image from "next/image";
import { ChevronLeft, ChevronRight, Expand } from "lucide-react";
import { cn } from "@/lib/utils";
import { getStorageUrl } from "@/lib/storage";

interface GalleryCarouselProps {
  images: { storage_path: string; alt: string | null }[];
}

export function GalleryCarousel({ images }: GalleryCarouselProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true }, [
    Autoplay({ delay: 5000, stopOnInteraction: true }),
  ]);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  const scrollTo = useCallback(
    (index: number) => {
      if (emblaApi) emblaApi.scrollTo(index);
    },
    [emblaApi]
  );

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

  if (images.length === 0) {
    return (
      <div className="aspect-[16/10] bg-surface border border-line flex items-center justify-center">
        <p className="text-muted">No images available</p>
      </div>
    );
  }

  return (
    <>
      <div className="relative">
        <div className="embla" ref={emblaRef}>
          <div className="embla__container">
            {images.map((image, idx) => {
              const url = getStorageUrl(image.storage_path) ?? "/images/placeholder-property.svg";
              return (
                <div key={idx} className="embla__slide relative aspect-[16/10] bg-surface">
                  <Image
                    src={url}
                    alt={image.alt ?? ""}
                    fill
                    sizes="(max-width: 768px) 100vw, 1000px"
                    className="object-cover"
                  />
                </div>
              );
            })}
          </div>
        </div>

        {/* Controls */}
        {images.length > 1 && (
          <>
            <button
              onClick={scrollPrev}
              className="absolute left-3 top-1/2 -translate-y-1/2 bg-white/80 p-2 hover:bg-white transition-colors"
              aria-label="Previous image"
            >
              <ChevronLeft size={20} />
            </button>
            <button
              onClick={scrollNext}
              className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/80 p-2 hover:bg-white transition-colors"
              aria-label="Next image"
            >
              <ChevronRight size={20} />
            </button>
            <button
              onClick={() => setLightboxOpen(true)}
              className="absolute top-3 right-3 bg-white/80 p-2 hover:bg-white transition-colors"
              aria-label="Expand image"
            >
              <Expand size={18} />
            </button>
          </>
        )}
      </div>

      {/* Thumbnail strip */}
      {images.length > 1 && (
        <div className="mt-3 flex gap-2 overflow-x-auto">
          {images.map((image, idx) => {
            const url = getStorageUrl(image.storage_path) ?? "/images/placeholder-property.svg";
            return (
              <button
                key={idx}
                onClick={() => scrollTo(idx)}
                className={cn(
                  "relative w-20 h-16 shrink-0 border-2 transition-colors",
                  idx === selectedIndex ? "border-accent" : "border-transparent opacity-60 hover:opacity-100"
                )}
              >
                <Image
                  src={url}
                  alt={image.alt ?? ""}
                  fill
                  sizes="80px"
                  className="object-cover"
                />
              </button>
            );
          })}
        </div>
      )}

      {/* Lightbox */}
      {lightboxOpen && (
        <div
          className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center p-4"
          onClick={() => setLightboxOpen(false)}
        >
          <button
            className="absolute top-4 right-4 text-white text-2xl"
            onClick={() => setLightboxOpen(false)}
          >
            ✕
          </button>
          <div className="relative w-full max-w-5xl aspect-[16/10]">
            <Image
              src={getStorageUrl(images[selectedIndex].storage_path) ?? "/images/placeholder-property.svg"}
              alt={images[selectedIndex].alt ?? ""}
              fill
              sizes="100vw"
              className="object-contain"
            />
          </div>
        </div>
      )}
    </>
  );
}