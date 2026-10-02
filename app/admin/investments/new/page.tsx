import { OpportunityForm } from "@/components/admin/OpportunityForm";
import { gql } from "@/lib/nhost/gql";
import type { Agent } from "@/lib/types";

export const dynamic = "force-dynamic";

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

export default async function NewOpportunityPage() {
  const agents = await getAgents();

  return (
    <div>
      <h1 className="font-display text-2xl text-ink mb-6">New Investment Opportunity</h1>
      <OpportunityForm agents={agents} />
    </div>
  );
}
