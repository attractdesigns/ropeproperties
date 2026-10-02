import Link from "next/link";
import Image from "next/image";
import { MapPin, Camera } from "lucide-react";
import type { PropertyWithRelations } from "@/lib/types";
import { formatPriceCompactWithPeriod } from "@/lib/format";
import { getStorageUrl } from "@/lib/storage";
import { StatusBadge, InvestmentBadge } from "./StatusBadge";
import { SpecIcons } from "./SpecIcons";

interface PropertyCardProps {
  property: PropertyWithRelations;
}

export function PropertyCard({ property }: PropertyCardProps) {
  const coverImage = property.property_images?.[0];
  const imageUrl = getStorageUrl(coverImage?.storage_path) ?? "/images/placeholder-property.svg";
  const imageCount = property.property_images?.length ?? 0;

  const location = [property.neighbourhood, property.city]
    .filter(Boolean)
    .join(", ");

  return (
    <Link
      href={`/listings/${property.slug}`}
      className="group block rounded-xl border border-line bg-bg overflow-hidden card-lift focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
    >
      <div className="img-hover relative aspect-[4/3] bg-surface">
        <Image
          src={imageUrl}
          alt={coverImage?.alt ?? property.title}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 33vw, 400px"
          className="object-cover"
        />
        {/* Soft gradient so the top-left pill always reads */}
        <div className="pointer-events-none absolute inset-x-0 top-0 h-20 bg-gradient-to-b from-black/35 to-transparent" />

        {/* Status pill — top-left, the standard real-estate pattern */}
        <div className="absolute top-3 left-3 flex gap-2">
          <StatusBadge status={property.status} />
          {property.is_investment && <InvestmentBadge />}
        </div>

        {/* Image counter — bottom-right, tiny but reassuring */}
        {imageCount > 1 && (
          <div className="absolute bottom-3 right-3 inline-flex items-center gap-1 rounded-full bg-black/55 px-2 py-1 text-xs font-medium text-white backdrop-blur-sm">
            <Camera size={12} aria-hidden />
            {imageCount}
          </div>
        )}

        {/* Partner badge — bottom-left (moved off right so it doesn't clash with counter) */}
        {property.partner_companies && (
          <div className="absolute bottom-3 left-3 rounded-full bg-white/90 px-2 py-1 text-[11px] font-medium text-ink backdrop-blur-sm">
            {property.partner_companies.name}
          </div>
        )}
      </div>

      <div className="p-5">
        {/* Price leads — the number that decides whether the card is read further */}
        <p className="font-display text-2xl font-medium text-ink tracking-tight">
          {formatPriceCompactWithPeriod(property.price, property.price_period)}
        </p>
        {property.is_investment && property.investment_note && (
          <p className="mt-1 text-xs text-accent">{property.investment_note}</p>
        )}

        <h3 className="mt-3 text-base font-medium text-ink line-clamp-1 group-hover:text-accent transition-colors">
          {property.title}
        </h3>
        {location && (
          <p className="mt-1 flex items-center gap-1 text-sm text-muted line-clamp-1">
            <MapPin size={14} className="shrink-0" />
            {location}
          </p>
        )}

        <div className="mt-4 pt-4 border-t border-line">
          <SpecIcons
            bedrooms={property.bedrooms}
            bathrooms={property.bathrooms}
            sizeSqm={property.size_sqm}
            compact
          />
        </div>
      </div>
    </Link>
  );
}

export function PropertyCardSkeleton() {
  return (
    <div className="rounded-xl border border-line overflow-hidden">
      <div className="skeleton aspect-[4/3]" />
      <div className="p-5 space-y-3">
        <div className="skeleton h-7 w-32 rounded" />
        <div className="skeleton h-4 w-full rounded" />
        <div className="skeleton h-4 w-2/3 rounded" />
        <div className="skeleton h-4 w-24 rounded mt-2" />
      </div>
    </div>
  );
}
