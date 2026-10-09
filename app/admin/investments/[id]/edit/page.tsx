import { OpportunityForm } from "@/components/admin/OpportunityForm";
import { gql } from "@/lib/nhost/gql";
import type { InvestmentOpportunity, InvestmentImage, Agent } from "@/lib/types";

export const dynamic = "force-dynamic";

async function getOpportunity(id: string) {
  const data = await gql<{
    investment_opportunities: (InvestmentOpportunity & { investment_images: InvestmentImage[] })[];
  }>(`
    query EditOpportunity($id: uuid!) {
      investment_opportunities(where: { id: { _eq: $id } }, limit: 1) {
        id title slug description status investment_type city neighbourhood
        roi_range min_entry duration map_embed_url is_featured agent_id created_at updated_at
        advertised_returns
        investment_images(order_by: { sort_order: asc }) {
          id opportunity_id storage_path alt sort_order
        }
      }
    }
  `, { id });
  return data.investment_opportunities[0] ?? null;
}

async function getAgents(): Promise<Agent[]> {
  const data = await gql<{ agents: Agent[] }>(`
    query AgentsForForm {
      agents(order_by: { sort_order: asc }) {
        id name role phone whatsapp email photo_path bio sort_order is_active is_primary
      }
    }
  `);
  return data.agents;
}

export default async function EditOpportunityPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [opportunity, agents] = await Promise.all([getOpportunity(id), getAgents()]);

  if (!opportunity) {
    return <p className="text-muted">Opportunity not found.</p>;
  }

  const images = opportunity.investment_images
    .sort((a, b) => a.sort_order - b.sort_order)
    .map((img) => ({
      id: img.id,
      storage_path: img.storage_path,
      sort_order: img.sort_order,
      alt: img.alt,
    }));

  return (
    <div>
      <h1 className="font-display text-2xl text-ink mb-6">Edit Opportunity</h1>
      <OpportunityForm opportunity={opportunity} images={images} agents={agents} />
    </div>
  );
}
