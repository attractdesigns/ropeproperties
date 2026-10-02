"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";

interface ListingsFiltersProps {
  cities: string[];
  currentParams: Record<string, string | undefined>;
}

const propertyTypes = [
  { value: "all", label: "All Types" },
  { value: "apartment", label: "Apartment" },
  { value: "house", label: "House" },
  { value: "duplex", label: "Duplex" },
  { value: "terrace", label: "Terrace" },
  { value: "bungalow", label: "Bungalow" },
  { value: "land", label: "Land" },
  { value: "commercial", label: "Commercial" },
];

const statusOptions = [
  { value: "all", label: "All" },
  { value: "for_sale", label: "For Sale" },
  { value: "sold", label: "Sold" },
];

const bedroomOptions = [
  { value: "any", label: "Any Beds" },
  { value: "1", label: "1+" },
  { value: "2", label: "2+" },
  { value: "3", label: "3+" },
  { value: "4", label: "4+" },
  { value: "5", label: "5+" },
];

export function ListingsFilters({ cities, currentParams }: ListingsFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const updateFilter = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value === "all" || value === "any") {
        params.delete(key);
      } else {
        params.set(key, value);
      }
      router.push(`/listings?${params.toString()}`);
    },
    [router, searchParams]
  );

  const selectClass =
    "mt-2 h-12 w-full rounded-lg border border-line bg-white px-3 text-sm text-ink focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20 cursor-pointer";

  return (
    <div className="mb-8 grid grid-cols-1 gap-3 rounded-xl border border-line bg-surface p-4 sm:grid-cols-2 lg:grid-cols-4">
      <label className="text-xs font-medium text-muted">Availability
      <select
        className={selectClass}
        value={currentParams.status ?? "all"}
        onChange={(e) => updateFilter("status", e.target.value)}
      >
        {statusOptions.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      </label>

      <label className="text-xs font-medium text-muted">Property type
      <select
        className={selectClass}
        value={currentParams.type ?? "all"}
        onChange={(e) => updateFilter("type", e.target.value)}
      >
        {propertyTypes.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      </label>

      <label className="text-xs font-medium text-muted">Bedrooms
      <select
        className={selectClass}
        value={currentParams.bedrooms ?? "any"}
        onChange={(e) => updateFilter("bedrooms", e.target.value)}
      >
        {bedroomOptions.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      </label>

      <label className="text-xs font-medium text-muted">Location
      <select
        className={selectClass}
        value={currentParams.city ?? "all"}
        onChange={(e) => updateFilter("city", e.target.value)}
      >
        <option value="all">All Cities</option>
        {cities.map((city) => (
          <option key={city} value={city}>
            {city}
          </option>
        ))}
      </select>
      </label>
    </div>
  );
}
