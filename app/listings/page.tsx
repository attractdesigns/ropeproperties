import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Section } from "@/components/Section";
import { PropertyCard } from "@/components/PropertyCard";
import { ListingsFilters } from "@/components/ListingsFilters";
import { createClient } from "@/lib/supabase/server";
import type { PropertyWithRelations, PropertyStatus, PropertyType } from "@/lib/types";
import Link from "next/link";
import { SearchX } from "lucide-react";

export const revalidate = 60;

type SearchParams = {
  status?: string;
  type?: string;
  bedrooms?: string;
  bathrooms?: string;
  city?: string;
  min_price?: string;
  max_price?: string;
  sort?: string;
};

async function getProperties(searchParams: SearchParams) {
  const supabase = await createClient();
  let query = supabase
    .from("properties")
    .select(`
      *,
      property_images (*),
      agents (*),
      partner_companies (*)
    `)
    .neq("status", "draft");

  // Filter values come from the URL, so only accept known enum members —
  // anything else is ignored rather than sent to Postgres.
  const statuses: PropertyStatus[] = ["for_sale", "sold"];
  const types: PropertyType[] = [
    "apartment", "house", "duplex", "terrace", "bungalow", "land", "commercial",
  ];

  if (statuses.includes(searchParams.status as PropertyStatus)) {
    query = query.eq("status", searchParams.status as PropertyStatus);
  }
  if (types.includes(searchParams.type as PropertyType)) {
    query = query.eq("property_type", searchParams.type as PropertyType);
  }
  // Both room filters are "N or more" — that is what the "3+" style labels in
  // the filter bar and the hero's stepper promise the visitor.
  if (searchParams.bedrooms && searchParams.bedrooms !== "any") {
    const beds = parseInt(searchParams.bedrooms);
    if (Number.isFinite(beds)) {
      query = query.gte("bedrooms", beds);
    }
  }
  if (searchParams.bathrooms && searchParams.bathrooms !== "any") {
    const baths = parseInt(searchParams.bathrooms);
    if (Number.isFinite(baths)) {
      query = query.gte("bathrooms", baths);
    }
  }
  if (searchParams.city && searchParams.city !== "all") {
    query = query.eq("city", searchParams.city);
  }
  if (searchParams.min_price) {
    query = query.gte("price", parseInt(searchParams.min_price));
  }
  if (searchParams.max_price) {
    query = query.lte("price", parseInt(searchParams.max_price));
  }

  // Sort — guarded against unexpected input.
  switch (searchParams.sort) {
    case "price_asc":
      query = query.order("price", { ascending: true });
      break;
    case "price_desc":
      query = query.order("price", { ascending: false });
      break;
    case "beds_desc":
      query = query.order("bedrooms", { ascending: false, nullsFirst: false });
      break;
    default:
      query = query.order("created_at", { ascending: false });
  }

  const { data } = await query;
  return (data ?? []) as unknown as PropertyWithRelations[];
}

async function getCities() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("properties")
    .select("city")
    .neq("status", "draft");
  // Deduplicate
  const cities = [...new Set((data ?? []).map((p) => p.city))];
  return cities.sort();
}

export default async function ListingsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const [properties, cities] = await Promise.all([
    getProperties(params),
    getCities(),
  ]);

  return (
    <>
      <Header />
      <main className="pt-16">
        <Section>
          <div className="mb-6">
            <p className="text-xs uppercase tracking-[0.2em] text-accent mb-2">
              Portfolio
            </p>
            <h1 className="font-display text-3xl md:text-5xl font-medium text-ink tracking-tight">
              All Listings
            </h1>
          </div>

          <ListingsFilters cities={cities} currentParams={params} totalCount={properties.length} />

          {properties.length === 0 ? (
            <div className="mx-auto max-w-md rounded-2xl border border-line bg-surface px-6 py-16 text-center">
              <div className="mx-auto mb-5 inline-flex h-14 w-14 items-center justify-center rounded-full bg-bg">
                <SearchX size={22} className="text-muted" />
              </div>
              <h2 className="font-display text-2xl text-ink">No matches</h2>
              <p className="mt-2 text-sm text-muted">
                Nothing lines up with those filters. Try widening the budget or
                removing a constraint.
              </p>
              <div className="mt-6 flex flex-wrap justify-center gap-3">
                <Link
                  href="/listings"
                  className="rounded-full border border-line bg-bg px-5 py-2.5 text-sm font-medium text-ink hover:border-accent hover:text-accent transition-colors"
                >
                  Clear filters
                </Link>
                <Link
                  href="/contact"
                  className="rounded-full bg-ink px-5 py-2.5 text-sm font-medium text-bg hover:bg-accent transition-colors"
                >
                  Tell me what you need
                </Link>
              </div>
            </div>
          ) : (
            <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-10">
              {properties.map((property) => (
                <PropertyCard key={property.id} property={property} />
              ))}
            </div>
          )}
        </Section>
      </main>
      <Footer />
    </>
  );
}
