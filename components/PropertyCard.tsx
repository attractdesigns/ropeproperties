import Link from "next/link";
import Image from "next/image";
import { MapPin } from "lucide-react";
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

  const location = [property.neighbourhood, property.city]
    .filter(Boolean)
    .join(", ");

  return (
    <Link href={`/listings/${property.slug}`} className="group block">
      <div className="img-hover relative aspect-[4/3] bg-surface border border-line">
        <Image
          src={imageUrl}
          alt={coverImage?.alt ?? property.title}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 33vw, 400px"
          className="object-cover"
        />
        {/* Badges overlay */}
        <div className="absolute top-3 left-3 flex gap-2">
          <StatusBadge status={property.status} />
          {property.is_investment && <InvestmentBadge />}
        </div>
        {/* Partner badge */}
        {property.partner_companies && (
          <div className="absolute bottom-3 right-3 bg-white/90 px-2 py-1 text-xs text-muted">
            {property.partner_companies.name}
          </div>
        )}
      </div>

      <div className="pt-4">
        <h3 className="font-display text-lg text-ink group-hover:text-accent transition-colors">
          {property.title}
        </h3>
        {location && (
          <p className="flex items-center gap-1 text-sm text-muted mt-1">
            <MapPin size={14} className="shrink-0" />
            {location}
          </p>
        )}
        <div className="mt-3">
          <SpecIcons
            bedrooms={property.bedrooms}
            bathrooms={property.bathrooms}
            sizeSqm={property.size_sqm}
            compact
          />
        </div>
        <p className="mt-3 font-display text-xl text-accent">
          {formatPriceCompactWithPeriod(property.price, property.price_period)}
        </p>
        {property.is_investment && property.investment_note && (
          <p className="mt-1 text-xs text-accent-deep">{property.investment_note}</p>
        )}
      </div>
    </Link>
  );
}