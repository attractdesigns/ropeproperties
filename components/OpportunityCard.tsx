import Link from "next/link";
import Image from "next/image";
import { MapPin, TrendingUp, Clock, Wallet } from "lucide-react";
import type { InvestmentWithRelations } from "@/lib/types";
import { formatPriceCompact } from "@/lib/format";
import { getStorageUrl } from "@/lib/storage";
import { InvestmentStatusBadge } from "./StatusBadge";

interface OpportunityCardProps {
  opportunity: InvestmentWithRelations;
}

const typeLabels: Record<string, string> = {
  off_plan: "Off-Plan",
  land_banking: "Land Banking",
  buy_to_let: "Buy-to-Let",
  development: "Development",
  flip: "Flip",
};

export function OpportunityCard({ opportunity }: OpportunityCardProps) {
  const coverImage = opportunity.investment_images?.[0];
  const imageUrl = getStorageUrl(coverImage?.storage_path) ?? "/images/placeholder-property.svg";

  const location = [opportunity.neighbourhood, opportunity.city]
    .filter(Boolean)
    .join(", ");

  return (
    <Link href={`/invest/${opportunity.slug}`} className="group block">
      <div className="img-hover relative aspect-[4/3] bg-surface border border-line">
        <Image
          src={imageUrl}
          alt={coverImage?.alt ?? opportunity.title}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 33vw, 400px"
          className="object-cover"
        />
        <div className="absolute top-3 left-3 flex gap-2">
          <span className="inline-flex items-center px-2.5 py-1 text-xs font-medium uppercase tracking-wide bg-accent-tint text-accent-deep">
            {typeLabels[opportunity.investment_type] ?? opportunity.investment_type}
          </span>
          <InvestmentStatusBadge status={opportunity.status} />
        </div>
      </div>

      <div className="pt-4">
        <h3 className="font-display text-lg text-ink group-hover:text-accent transition-colors">
          {opportunity.title}
        </h3>
        {location && (
          <p className="flex items-center gap-1 text-sm text-muted mt-1">
            <MapPin size={14} className="shrink-0" />
            {location}
          </p>
        )}

        <div className="mt-3 space-y-1.5 text-sm">
          {opportunity.roi_range && (
            <p className="flex items-center gap-2 text-accent-deep">
              <TrendingUp size={14} className="shrink-0" />
              {opportunity.roi_range}
            </p>
          )}
          {opportunity.min_entry != null && (
            <p className="flex items-center gap-2 text-muted">
              <Wallet size={14} className="shrink-0" />
              From {formatPriceCompact(opportunity.min_entry)}
            </p>
          )}
          {opportunity.duration && (
            <p className="flex items-center gap-2 text-muted">
              <Clock size={14} className="shrink-0" />
              {opportunity.duration}
            </p>
          )}
        </div>
      </div>
    </Link>
  );
}