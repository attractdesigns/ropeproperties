import { ListingForm } from "@/components/admin/ListingForm";
import { gql } from "@/lib/nhost/gql";
import type { Agent, PartnerCompany } from "@/lib/types";

export const dynamic = "force-dynamic";

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

export default async function NewListingPage() {
  const { agents, partners } = await getAgentsAndPartners();

  return (
    <div>
      <h1 className="font-display text-2xl text-ink mb-6">New Listing</h1>
      <ListingForm agents={agents} partners={partners} />
    </div>
  );
}
