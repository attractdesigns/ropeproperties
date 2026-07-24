import { Bed, Bath, Toilet, Car, Maximize, Home } from "lucide-react";

interface SpecIconsProps {
  bedrooms?: number | null;
  bathrooms?: number | null;
  toilets?: number | null;
  parking?: number | null;
  sizeSqm?: number | null;
  propertyType?: string;
  compact?: boolean;
}

export function SpecIcons({
  bedrooms,
  bathrooms,
  toilets,
  parking,
  sizeSqm,
  propertyType,
  compact = false,
}: SpecIconsProps) {
  const iconSize = compact ? 14 : 16;
  const textSize = compact ? "text-xs" : "text-sm";

  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-muted">
      {bedrooms != null && (
        <span className="inline-flex items-center gap-1">
          <Bed size={iconSize} />
          <span className={textSize}>{bedrooms} bed</span>
        </span>
      )}
      {bathrooms != null && (
        <span className="inline-flex items-center gap-1">
          <Bath size={iconSize} />
          <span className={textSize}>{bathrooms} bath</span>
        </span>
      )}
      {toilets != null && (
        <span className="inline-flex items-center gap-1">
          <Toilet size={iconSize} />
          <span className={textSize}>{toilets}</span>
        </span>
      )}
      {parking != null && (
        <span className="inline-flex items-center gap-1">
          <Car size={iconSize} />
          <span className={textSize}>{parking}</span>
        </span>
      )}
      {sizeSqm != null && (
        <span className="inline-flex items-center gap-1">
          <Maximize size={iconSize} />
          <span className={textSize}>{sizeSqm} m²</span>
        </span>
      )}
      {propertyType && (
        <span className="inline-flex items-center gap-1">
          <Home size={iconSize} />
          <span className={textSize}>{formatPropertyType(propertyType)}</span>
        </span>
      )}
    </div>
  );
}

function formatPropertyType(type: string): string {
  return type
    .split("_")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}