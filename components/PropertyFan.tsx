import Image from "next/image";
import Link from "next/link";
import { ArrowRight, MapPin } from "lucide-react";
import type { PropertyWithRelations } from "@/lib/types";
import { getStorageUrl } from "@/lib/storage";
import { formatPriceCompactWithPeriod } from "@/lib/format";

const statusLabels: Record<string, string> = {
  for_sale: "For Sale",
  sold: "Sold",
};

// The featured band sits between the near-black hero floor and the light body
// below, so it carries its own lighter slate tone. Both edges are handled here:
// a scrim at the top blends out of the hero, and a full-height ramp at the
// bottom fades into the light `surface` the About section opens on.
const BAND = "#293a43";

export function PropertyFan({ properties }: { properties: PropertyWithRelations[] }) {
  if (properties.length === 0) return null;

  const cards = properties.slice(0, 4);

  return (
    <section className="relative isolate" style={{ backgroundColor: BAND }}>
      <div className="relative mx-auto max-w-[1200px] px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
        <div className="text-center">
          <p className="text-[10px] uppercase tracking-[0.3em] text-white/45">Featured</p>
          <h2 className="mt-3 font-display italic text-3xl sm:text-4xl text-white">
            Select a Property
          </h2>
        </div>

        {/* Flat aligned row — every card shares a baseline, so the band needs no
            reserved space underneath for staggered offsets. */}
        <div className="mt-10 flex snap-x snap-mandatory gap-4 overflow-x-auto px-1 pb-4 sm:gap-5 lg:mt-12 lg:grid lg:grid-cols-4 lg:items-stretch lg:overflow-visible lg:px-0">
          {cards.map((property) => {
            const cover = property.property_images?.[0];
            const imageUrl =
              getStorageUrl(cover?.storage_path) ?? "/images/placeholder-property.svg";
            const location = [property.neighbourhood, property.city]
              .filter(Boolean)
              .join(", ");
            const specs = [
              property.bedrooms != null ? `${property.bedrooms} Beds` : null,
              property.bathrooms != null ? `${property.bathrooms} Baths` : null,
              property.size_sqm != null ? `${property.size_sqm} sq m` : null,
            ].filter(Boolean);

            return (
              <Link
                key={property.id}
                href={`/listings/${property.slug}`}
                className="group flex w-[min(82vw,330px)] shrink-0 snap-start flex-col overflow-hidden rounded-2xl bg-alpine-card shadow-[0_30px_70px_-25px_rgba(0,0,0,0.85)] transition-transform duration-500 hover:-translate-y-1.5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white lg:w-auto"
              >
                {/* Replaces the decorative phone chrome that used to sit here —
                    same slot, real data. Status and price are therefore not
                    repeated in the detail block below. */}
                <div className="flex items-center justify-between gap-3 px-4 py-3 text-[10px] uppercase tracking-[0.18em]">
                  <span className="text-alpine-ice">
                    {statusLabels[property.status] ?? property.status}
                  </span>
                  <span className="tracking-[0.12em] text-white">
                    {formatPriceCompactWithPeriod(property.price, property.price_period)}
                  </span>
                </div>

                <div className="relative aspect-[4/3] w-full overflow-hidden">
                  <Image
                    src={imageUrl}
                    alt={cover?.alt ?? property.title}
                    fill
                    sizes="(max-width: 1024px) 82vw, 280px"
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                </div>

                <div className="flex flex-1 flex-col px-4 py-4">
                  <h3 className="font-display text-base uppercase tracking-wide text-white line-clamp-1">
                    {property.title}
                  </h3>
                  {specs.length > 0 && (
                    <p className="mt-1.5 text-[11px] text-alpine-ice/85">
                      {specs.join(" | ")}
                    </p>
                  )}
                  <p className="mt-3 text-xs leading-relaxed text-white/55 line-clamp-3">
                    {property.description}
                  </p>

                  <div className="mt-auto pt-5">
                    {location && (
                      <span className="flex items-center gap-2 text-[11px] text-white/55">
                        <MapPin size={12} className="shrink-0 text-white/35" />
                        <span className="truncate">{location}</span>
                      </span>
                    )}
                    <span className="mt-3 inline-flex items-center gap-1.5 text-[10px] uppercase tracking-[0.18em] text-white transition-colors group-hover:text-alpine-ice">
                      Property Details
                      <ArrowRight
                        size={12}
                        className="transition-transform duration-300 group-hover:translate-x-1"
                      />
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        <div className="mt-12 text-center">
          <Link
            href="/listings"
            className="group inline-flex items-center gap-2 border-b border-white/25 pb-1 text-[10px] uppercase tracking-[0.22em] text-white/80 transition-colors hover:border-alpine-ice hover:text-white"
          >
            View all listings
            <ArrowRight
              size={13}
              className="transition-transform duration-300 group-hover:translate-x-1"
            />
          </Link>
        </div>
      </div>

    </section>
  );
}
