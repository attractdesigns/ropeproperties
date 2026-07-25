import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { PartnerForm } from "@/components/admin/PartnerForm";
import type { PartnerCompany } from "@/lib/types";

export const dynamic = "force-dynamic";

async function getPartner(id: string): Promise<PartnerCompany | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("partner_companies")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  return data ?? null;
}

export default async function EditPartnerPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const partner = await getPartner(id);
  if (!partner) notFound();

  return (
    <div>
      <Link
        href="/admin/partners"
        className="inline-flex items-center gap-1 text-sm text-muted hover:text-ink mb-4"
      >
        <ArrowLeft size={14} /> Back to partners
      </Link>

      <h1 className="font-display text-2xl text-ink mb-6">Edit {partner.name}</h1>

      <div className="bg-white border border-line p-4">
        <PartnerForm partner={partner} />
      </div>
    </div>
  );
}