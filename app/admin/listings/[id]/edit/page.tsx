import { ListingForm } from "@/components/admin/ListingForm";
import { gql } from "@/lib/nhost/gql";
import type { Property, PropertyImage, Agent, PartnerCompany } from "@/lib/types";

export const dynamic = "force-dynamic";

async function getProperty(id: string) {
  const data = await gql<{
    properties: (Property & { property_images: PropertyImage[] })[];
  }>(`
    query EditProperty($id: uuid!) {
      properties(where: { id: { _eq: $id } }, limit: 1) {
        id title slug description status property_type price price_period
        bedrooms bathrooms toilets parking size_sqm city neighbourhood address
        features map_embed_url is_featured is_investment investment_note
        partner_id agent_id created_at updated_at plot_options payment_terms
        property_images(order_by: { sort_order: asc }) {
          id property_id storage_path alt sort_order
        }
      }
    }
  `, { id });
  return data.properties[0] ?? null;
}

async function getAgentsAndPartners() {
  const data = await gql<{ agents: Agent[]; partner_companies: PartnerCompany[] }>(`
    query ListingFormData {
      agents(order_by: { sort_order: asc }) {
        id name role phone whatsapp email photo_path bio sort_order is_active is_primary
      }
      partner_companies(
        where: { is_active: { _eq: true } }
        order_by: { sort_order: asc }
      ) {
        id name logo_path website_url description sort_order is_active
      }
    }
  `);
  return { agents: data.agents, partners: data.partner_companies };
}

export default async function EditListingPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [property, { agents, partners }] = await Promise.all([
    getProperty(id),
    getAgentsAndPartners(),
  ]);

  if (!property) {
    return <p className="text-muted">Property not found.</p>;
  }

  const images = property.property_images
    .sort((a, b) => a.sort_order - b.sort_order)
    .map((img) => ({
      id: img.id,
      storage_path: img.storage_path,
      sort_order: img.sort_order,
      alt: img.alt,
    }));

  return (
    <div>
      <h1 className="font-display text-2xl text-ink mb-6">Edit Listing</h1>
      <ListingForm property={property} images={images} agents={agents} partners={partners} />
    </div>
  );
}
