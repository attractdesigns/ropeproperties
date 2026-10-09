import Link from "next/link";
import { ArrowRight, MapPin, Bed, Bath, Maximize } from "lucide-react";
import type { PropertyWithRelations } from "@/lib/types";
import { getStorageUrl } from "@/lib/storage";
import { formatPriceCompactWithPeriod, formatPlotRange } from "@/lib/format";
import { SmartImage } from "./SmartImage";
import { FeaturedTrack } from "./FeaturedTrack";

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
      <div className="relative mx-auto max-w-[1200px] px-4 py-20 sm:px-6 lg:px-8 lg:py-24">
        <div className="text-center">
          <p className="text-[10px] uppercase tracking-[0.3em] text-white/45">Featured</p>
          <h2 className="mt-3 font-display italic text-3xl sm:text-4xl text-white">
            Select a Property
          </h2>
        </div>

        <FeaturedTrack>
          {cards.map((property) => {
            const cover = property.property_images?.[0];
            const imageUrl = getStorageUrl(cover?.storage_path);
            const location = [property.neighbourhood, property.city]
              .filter(Boolean)
              .join(", ");
            const sizeLabel =
              property.size_sqm != null
                ? `${property.size_sqm} sq m`
                : formatPlotRange(property.plot_options);
            const facts = [
              property.bedrooms != null && { Icon: Bed, label: `${property.bedrooms} Beds` },
              property.bathrooms != null && { Icon: Bath, label: `${property.bathrooms} Baths` },
              sizeLabel && { Icon: Maximize, label: sizeLabel },
            ].filter(Boolean) as { Icon: typeof Bed; label: string }[];

            return (
              <Link
                key={property.id}
                href={`/listings/${property.slug}`}
                className="group flex w-[calc(100vw-32px)] shrink-0 snap-center snap-always flex-col overflow-hidden rounded-[20px] border border-white/10 bg-alpine-card shadow-[0_20px_50px_-20px_rgba(0,0,0,0.7)] transition-transform duration-500 hover:-translate-y-1.5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white lg:w-auto"
              >
                <div className="relative aspect-[4/3] w-full overflow-hidden bg-alpine-slate">
                  <SmartImage
                    src={imageUrl}
                    alt={cover?.alt || property.title}
                    title={property.title}
                    sizes="(max-width: 1024px) calc(100vw - 32px), 280px"
                    className="transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="pointer-events-none absolute inset-x-0 top-0 h-20 bg-gradient-to-b from-black/45 to-transparent" />
                  <span className="absolute left-3 top-3 rounded-full bg-black/55 px-3 py-1.5 text-[11px] font-medium uppercase tracking-[0.14em] text-alpine-ice backdrop-blur-sm">
                    {statusLabels[property.status] ?? property.status}
                  </span>
                  <span className="absolute right-3 top-3 rounded-full bg-white px-3 py-1.5 text-sm font-semibold text-alpine-void shadow-md">
                    {formatPriceCompactWithPeriod(property.price, property.price_period)}
                  </span>
                </div>

                <div className="flex flex-1 flex-col p-5">
                  <h3 className="font-display text-[23px] leading-tight text-white line-clamp-2 lg:text-lg">
                    {property.title}
                  </h3>
                  {location && (
                    <p className="mt-2 flex items-center gap-1.5 text-sm text-white/65">
                      <MapPin size={14} className="shrink-0 text-white/45" aria-hidden />
                      <span className="line-clamp-1">{location}</span>
                    </p>
                  )}

                  {facts.length > 0 && (
                    <ul className="mt-4 flex flex-wrap gap-2">
                      {facts.map(({ Icon, label }) => (
                        <li
                          key={label}
                          className="inline-flex items-center gap-1.5 rounded-full bg-white/[0.07] px-3 py-1.5 text-xs text-alpine-ice"
                        >
                          <Icon size={14} aria-hidden />
                          {label}
                        </li>
                      ))}
                    </ul>
                  )}

                  {property.description && (
                    <p className="mt-4 text-sm leading-relaxed text-white/60 line-clamp-3">
                      {property.description}
                    </p>
                  )}

                  <span className="mt-auto flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-white px-4 text-sm font-medium text-alpine-void transition-colors group-hover:bg-alpine-ice [margin-top:1.5rem]">
                    View property
                    <ArrowRight
                      size={16}
                      className="transition-transform duration-300 group-hover:translate-x-1"
                      aria-hidden
                    />
                  </span>
                </div>
              </Link>
            );
          })}
        </FeaturedTrack>

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
