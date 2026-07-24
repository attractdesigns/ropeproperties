import { ListingForm } from "@/components/admin/ListingForm";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

async function getAgentsAndPartners() {
  const supabase = await createClient();
  const [agentsRes, partnersRes] = await Promise.all([
    supabase.from("agents").select("*").order("sort_order"),
    supabase.from("partner_companies").select("*").eq("is_active", true).order("sort_order"),
  ]);
  return {
    agents: agentsRes.data ?? [],
    partners: partnersRes.data ?? [],
  };
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