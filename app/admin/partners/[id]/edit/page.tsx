import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { gql } from "@/lib/nhost/gql";
import { PartnerForm } from "@/components/admin/PartnerForm";
import type { PartnerCompany } from "@/lib/types";

export const dynamic = "force-dynamic";

async function getPartner(id: string): Promise<PartnerCompany | null> {
  const data = await gql<{ partner_companies: PartnerCompany[] }>(`
    query EditPartner($id: uuid!) {
      partner_companies(where: { id: { _eq: $id } }, limit: 1) {
        id name logo_path website_url description sort_order is_active
      }
    }
  `, { id });
  return data.partner_companies[0] ?? null;
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
      <Link href="/admin/partners" className="inline-flex items-center gap-1 text-sm text-muted hover:text-ink mb-4">
        <ArrowLeft size={14} /> Back to partners
      </Link>

      <h1 className="font-display text-2xl text-ink mb-6">Edit {partner.name}</h1>

      <div className="bg-white border border-line p-4">
        <PartnerForm partner={partner} />
      </div>
    </div>
  );
}
