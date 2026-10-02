import { gql } from "../gql";
import type { PropertyWithRelations } from "@/lib/types";

/**
 * Reference query — mirrors the old
 *   supabase.from("properties").select("*, property_images(*), agents(*), partner_companies(*)")
 *     .eq("is_featured", true).neq("status", "draft").order("created_at", {ascending: false}).limit(6)
 *
 * Nhost's Hasura exposes each tracked table as a plural GraphQL field.
 * Snake_case column names stay snake_case. Related tables come through as
 * nested fields the same shape Supabase gave us, so PropertyWithRelations
 * does not need to change.
 */
const FEATURED_PROPERTIES = /* GraphQL */ `
  query FeaturedProperties($limit: Int!) {
    properties(
      where: {
        is_featured: { _eq: true }
        status: { _neq: "draft" }
      }
      order_by: { created_at: desc }
      limit: $limit
    ) {
      id
      slug
      title
      description
      status
      city
      neighbourhood
      bedrooms
      bathrooms
      toilets
      parking
      size_sqm
      price
      price_period
      property_type
      is_featured
      is_investment
      investment_note
      features
      map_embed_url
      created_at
      property_images(order_by: { sort_order: asc }) {
        id
        storage_path
        alt
        sort_order
      }
      agents: agent {
        id
        name
        role
        email
        phone
        whatsapp
        bio
        photo_path
        is_primary
        is_active
        sort_order
      }
      partner_companies: partner_company {
        id
        name
        description
        website_url
        logo_path
        is_active
        sort_order
      }
    }
  }
`;

export async function getFeaturedProperties(
  limit = 6
): Promise<PropertyWithRelations[]> {
  const data = await gql<{ properties: PropertyWithRelations[] }>(
    FEATURED_PROPERTIES,
    { limit }
  );
  return data.properties;
}
