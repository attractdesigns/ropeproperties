"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useState } from "react";
import { SlidersHorizontal, X } from "lucide-react";

interface ListingsFiltersProps {
  cities: string[];
  currentParams: Record<string, string | undefined>;
  totalCount: number;
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

const sortOptions = [
  { value: "newest", label: "Newest" },
  { value: "price_asc", label: "Price ↑" },
  { value: "price_desc", label: "Price ↓" },
  { value: "beds_desc", label: "Most beds" },
];

export function ListingsFilters({ cities, currentParams, totalCount }: ListingsFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [mobileOpen, setMobileOpen] = useState(false);

  const updateFilter = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value === "all" || value === "any" || value === "") {
        params.delete(key);
      } else {
        params.set(key, value);
      }
      router.push(`/listings?${params.toString()}`);
    },
    [router, searchParams]
  );

  const activeFilterCount = [
    currentParams.status,
    currentParams.type,
    currentParams.bedrooms,
    currentParams.city,
    currentParams.min_price,
    currentParams.max_price,
  ].filter((v) => v && v !== "all" && v !== "any").length;

  const currentSort = currentParams.sort ?? "newest";

  const clearAll = () => router.push("/listings");

  const selectClass =
    "mt-1.5 h-11 w-full rounded-lg border border-line bg-bg px-3 text-sm text-ink focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20 cursor-pointer";

  return (
    <div className="mb-8">
      {/* Sticky bar: result count + sort pills + mobile filter trigger */}
      <div className="sticky top-16 z-30 -mx-4 border-y border-line bg-bg/90 px-4 py-3 backdrop-blur-md sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
        <div className="flex items-center justify-between gap-3">
          <p className="text-sm text-muted">
            <span className="font-medium text-ink">{totalCount}</span>{" "}
            {totalCount === 1 ? "property" : "properties"}
          </p>

          {/* Sort pills on desktop */}
          <div className="hidden items-center gap-1 md:flex">
            <span className="mr-2 text-xs uppercase tracking-wide text-muted">Sort</span>
            {sortOptions.map((opt) => (
              <button
                key={opt.value}
                onClick={() => updateFilter("sort", opt.value)}
                className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                  currentSort === opt.value
                    ? "bg-ink text-bg"
                    : "text-muted hover:text-ink"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>

          {/* Mobile filter trigger */}
          <button
            onClick={() => setMobileOpen(true)}
            className="inline-flex items-center gap-2 rounded-full border border-line bg-bg px-4 py-2 text-sm font-medium text-ink md:hidden"
          >
            <SlidersHorizontal size={14} />
            Filters
            {activeFilterCount > 0 && (
              <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-accent px-1.5 text-[11px] font-semibold text-white">
                {activeFilterCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Desktop filter grid */}
      <div className="mt-4 hidden grid-cols-4 gap-3 rounded-xl border border-line bg-surface p-4 md:grid">
        <FilterSelect
          label="Availability"
          value={currentParams.status ?? "all"}
          onChange={(v) => updateFilter("status", v)}
          options={statusOptions}
          className={selectClass}
        />
        <FilterSelect
          label="Property type"
          value={currentParams.type ?? "all"}
          onChange={(v) => updateFilter("type", v)}
          options={propertyTypes}
          className={selectClass}
        />
        <FilterSelect
          label="Bedrooms"
          value={currentParams.bedrooms ?? "any"}
          onChange={(v) => updateFilter("bedrooms", v)}
          options={bedroomOptions}
          className={selectClass}
        />
        <FilterSelect
          label="Location"
          value={currentParams.city ?? "all"}
          onChange={(v) => updateFilter("city", v)}
          options={[{ value: "all", label: "All Cities" }, ...cities.map((c) => ({ value: c, label: c }))]}
          className={selectClass}
        />
      </div>

      {/* Active chips row (desktop) */}
      {activeFilterCount > 0 && (
        <div className="mt-3 hidden flex-wrap items-center gap-2 md:flex">
          <span className="text-xs uppercase tracking-wide text-muted">Active:</span>
          <button
            onClick={clearAll}
            className="inline-flex items-center gap-1 rounded-full border border-line px-3 py-1 text-xs text-muted hover:border-accent hover:text-accent"
          >
            Clear all <X size={12} />
          </button>
        </div>
      )}

      {/* Mobile sheet */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden" role="dialog" aria-modal="true">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setMobileOpen(false)}
          />
          <div className="absolute inset-x-0 bottom-0 max-h-[85vh] overflow-y-auto rounded-t-2xl bg-bg p-5 shadow-2xl">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-display text-xl text-ink">Filters</h3>
              <button
                onClick={() => setMobileOpen(false)}
                className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-line text-ink"
                aria-label="Close"
              >
                <X size={16} />
              </button>
            </div>
            <div className="space-y-4">
              <FilterSelect
                label="Availability"
                value={currentParams.status ?? "all"}
                onChange={(v) => updateFilter("status", v)}
                options={statusOptions}
                className={selectClass}
              />
              <FilterSelect
                label="Property type"
                value={currentParams.type ?? "all"}
                onChange={(v) => updateFilter("type", v)}
                options={propertyTypes}
                className={selectClass}
              />
              <FilterSelect
                label="Bedrooms"
                value={currentParams.bedrooms ?? "any"}
                onChange={(v) => updateFilter("bedrooms", v)}
                options={bedroomOptions}
                className={selectClass}
              />
              <FilterSelect
                label="Location"
                value={currentParams.city ?? "all"}
                onChange={(v) => updateFilter("city", v)}
                options={[{ value: "all", label: "All Cities" }, ...cities.map((c) => ({ value: c, label: c }))]}
                className={selectClass}
              />
              <FilterSelect
                label="Sort by"
                value={currentSort}
                onChange={(v) => updateFilter("sort", v)}
                options={sortOptions}
                className={selectClass}
              />
            </div>
            <div className="mt-6 flex gap-3">
              <button
                onClick={clearAll}
                className="flex-1 rounded-lg border border-line px-4 py-3 text-sm font-medium text-ink"
              >
                Clear all
              </button>
              <button
                onClick={() => setMobileOpen(false)}
                className="flex-1 rounded-lg bg-ink px-4 py-3 text-sm font-medium text-bg"
              >
                Show {totalCount}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function FilterSelect({
  label,
  value,
  onChange,
  options,
  className,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
  className: string;
}) {
  return (
    <label className="block text-xs font-medium uppercase tracking-wide text-muted">
      {label}
      <select
        className={className}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </label>
  );
}
