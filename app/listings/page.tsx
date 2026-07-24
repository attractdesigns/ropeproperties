import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Section } from "@/components/Section";
import { PropertyCard } from "@/components/PropertyCard";
import { ListingsFilters } from "@/components/ListingsFilters";
import { createClient } from "@/lib/supabase/server";
import type { PropertyWithRelations, PropertyStatus, PropertyType } from "@/lib/types";
import Link from "next/link";

export const revalidate = 60;

type SearchParams = {
  status?: string;
  type?: string;
  bedrooms?: string;
  city?: string;
  min_price?: string;
  max_price?: string;
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
    .neq("status", "draft")
    .order("created_at", { ascending: false });

  // Filter values come from the URL, so only accept known enum members —
  // anything else is ignored rather than sent to Postgres.
  const statuses: PropertyStatus[] = ["for_sale", "for_rent", "sold", "let"];
  const types: PropertyType[] = [
    "apartment", "house", "duplex", "terrace", "bungalow", "land", "commercial",
  ];

  if (statuses.includes(searchParams.status as PropertyStatus)) {
    query = query.eq("status", searchParams.status as PropertyStatus);
  }
  if (types.includes(searchParams.type as PropertyType)) {
    query = query.eq("property_type", searchParams.type as PropertyType);
  }
  if (searchParams.bedrooms && searchParams.bedrooms !== "any") {
    const beds = parseInt(searchParams.bedrooms);
    if (beds === 5) {
      query = query.gte("bedrooms", 5);
    } else {
      query = query.eq("bedrooms", beds);
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
          <h1 className="font-display text-3xl md:text-4xl font-medium text-ink mb-8">
            All Listings
          </h1>

          <ListingsFilters cities={cities} currentParams={params} />

          {properties.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-muted text-lg">No properties match your filters.</p>
              <p className="text-muted text-sm mt-2">
                Try adjusting your search or{" "}
                <Link href="/contact" className="text-accent hover:text-accent-deep">
                  contact us
                </Link>{" "}
                with your requirements.
              </p>
            </div>
          ) : (
            <>
              <p className="text-sm text-muted mb-6">
                {properties.length} {properties.length === 1 ? "property" : "properties"} found
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-10">
                {properties.map((property) => (
                  <PropertyCard key={property.id} property={property} />
                ))}
              </div>
            </>
          )}
        </Section>
      </main>
      <Footer />
    </>
  );
}