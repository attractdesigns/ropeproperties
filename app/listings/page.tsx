import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Section } from "@/components/Section";
import { PropertyCard } from "@/components/PropertyCard";
import { ListingsFilters } from "@/components/ListingsFilters";
import { gql } from "@/lib/nhost/gql";
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

const PROPERTY_FIELDS = /* GraphQL */ `
  id slug title description status property_type price price_period
  bedrooms bathrooms toilets parking size_sqm city neighbourhood
  features map_embed_url is_featured is_investment investment_note
  partner_id agent_id created_at updated_at
  property_images(order_by: { sort_order: asc }) {
    id property_id storage_path alt sort_order
  }
  agents: agent { id name role phone whatsapp email photo_path bio is_primary is_active sort_order }
  partner_companies: partner_company { id name description logo_path website_url is_active sort_order }
`;

const statuses: PropertyStatus[] = ["for_sale", "sold"];
const types: PropertyType[] = [
  "apartment", "house", "duplex", "terrace", "bungalow", "land", "commercial",
];

async function getProperties(searchParams: SearchParams): Promise<PropertyWithRelations[]> {
  const where: Record<string, unknown> = { status: { _neq: "draft" } };

  if (statuses.includes(searchParams.status as PropertyStatus)) {
    where.status = { _eq: searchParams.status };
  }
  if (types.includes(searchParams.type as PropertyType)) {
    where.property_type = { _eq: searchParams.type };
  }
  if (searchParams.bedrooms && searchParams.bedrooms !== "any") {
    const beds = parseInt(searchParams.bedrooms);
    if (Number.isFinite(beds)) where.bedrooms = { _gte: beds };
  }
  if (searchParams.bathrooms && searchParams.bathrooms !== "any") {
    const baths = parseInt(searchParams.bathrooms);
    if (Number.isFinite(baths)) where.bathrooms = { _gte: baths };
  }
  if (searchParams.city && searchParams.city !== "all") {
    where.city = { _eq: searchParams.city };
  }
  if (searchParams.min_price) {
    where.price = { ...((where.price as object) ?? {}), _gte: parseInt(searchParams.min_price) };
  }
  if (searchParams.max_price) {
    where.price = { ...((where.price as object) ?? {}), _lte: parseInt(searchParams.max_price) };
  }

  let orderBy: Record<string, string>;
  switch (searchParams.sort) {
    case "price_asc":  orderBy = { price: "asc" }; break;
    case "price_desc": orderBy = { price: "desc" }; break;
    case "beds_desc":  orderBy = { bedrooms: "desc_nulls_last" }; break;
    default:           orderBy = { created_at: "desc" };
  }

  const data = await gql<{ properties: PropertyWithRelations[] }>(`
    query Listings($where: properties_bool_exp, $order_by: properties_order_by!) {
      properties(where: $where, order_by: [$order_by]) { ${PROPERTY_FIELDS} }
    }
  `, { where, order_by: orderBy });

  return data.properties;
}

async function getCities(): Promise<string[]> {
  const data = await gql<{ properties: { city: string }[] }>(`
    query ListingCities {
      properties(
        where: { status: { _neq: "draft" } }
        distinct_on: city
        order_by: { city: asc }
      ) { city }
    }
  `);
  return data.properties.map((p) => p.city);
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
