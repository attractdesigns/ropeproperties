import { OpportunityForm } from "@/components/admin/OpportunityForm";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

async function getAgents() {
  const supabase = await createClient();
  const { data } = await supabase.from("agents").select("*").order("sort_order");
  return data ?? [];
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