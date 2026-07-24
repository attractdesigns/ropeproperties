import { OpportunityForm } from "@/components/admin/OpportunityForm";
import { createClient } from "@/lib/supabase/server";
import type { InvestmentOpportunity, InvestmentImage, Agent } from "@/lib/types";

export const dynamic = "force-dynamic";

async function getOpportunity(id: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("investment_opportunities")
    .select(`*, investment_images (*)`)
    .eq("id", id)
    .single();
  return data as unknown as (InvestmentOpportunity & { investment_images: InvestmentImage[] }) | null;
}

async function getAgents() {
  const supabase = await createClient();
  const { data } = await supabase.from("agents").select("*").order("sort_order");
  return (data ?? []) as Agent[];
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