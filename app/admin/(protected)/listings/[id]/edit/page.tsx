import { ListingForm } from "@/components/admin/ListingForm";
import { createClient } from "@/lib/supabase/server";
import type { Property, PropertyImage, Agent, PartnerCompany } from "@/lib/types";

export const dynamic = "force-dynamic";

async function getProperty(id: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("properties")
    .select(`
      *,
      property_images (*)
    `)
    .eq("id", id)
    .single();
  return data as unknown as (Property & { property_images: PropertyImage[] }) | null;
}

async function getAgentsAndPartners() {
  const supabase = await createClient();
  const [agentsRes, partnersRes] = await Promise.all([
    supabase.from("agents").select("*").order("sort_order"),
    supabase.from("partner_companies").select("*").eq("is_active", true).order("sort_order"),
  ]);
  return {
    agents: (agentsRes.data ?? []) as Agent[],
    partners: (partnersRes.data ?? []) as PartnerCompany[],
  };
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
      <ListingForm
        property={property}
        images={images}
        agents={agents}
        partners={partners}
      />
    </div>
  );
}