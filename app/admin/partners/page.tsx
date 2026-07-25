import Image from "next/image";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getStorageUrl } from "@/lib/storage";
import { PartnerForm } from "@/components/admin/PartnerForm";
import { DeleteButton } from "@/components/admin/DeleteButton";
import type { PartnerCompany } from "@/lib/types";

export const dynamic = "force-dynamic";

async function getPartners(): Promise<PartnerCompany[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("partner_companies")
    .select("*")
    .order("sort_order", { ascending: true });
  return data ?? [];
}

export default async function AdminPartnersPage() {
  const partners = await getPartners();

  return (
    <div>
      <h1 className="font-display text-2xl text-ink mb-6">Partners</h1>

      <div className="bg-white border border-line mb-8">
        <div className="p-4 border-b border-line">
          <h2 className="font-display text-lg text-ink">Add New Partner</h2>
        </div>
        <div className="p-4">
          <PartnerForm />
        </div>
      </div>

      <div className="bg-white border border-line overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-line text-left">
              <th className="p-3 text-xs font-medium text-muted uppercase">Logo</th>
              <th className="p-3 text-xs font-medium text-muted uppercase">Name</th>
              <th className="p-3 text-xs font-medium text-muted uppercase">Website</th>
              <th className="p-3 text-xs font-medium text-muted uppercase">Description</th>
              <th className="p-3 text-xs font-medium text-muted uppercase">Active</th>
              <th className="p-3 text-xs font-medium text-muted uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {partners.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-8 text-center text-muted">No partners yet.</td>
              </tr>
            ) : (
              partners.map((partner) => {
                const logoUrl = getStorageUrl(partner.logo_path);
                return (
                  <tr key={partner.id} className="hover:bg-surface">
                    <td className="p-3">
                      {logoUrl ? (
                        <div className="relative w-16 h-8">
                          <Image src={logoUrl} alt={partner.name} fill sizes="64px" className="object-contain" />
                        </div>
                      ) : (
                        <span className="text-sm text-muted">—</span>
                      )}
                    </td>
                    <td className="p-3 text-sm font-medium text-ink">{partner.name}</td>
                    <td className="p-3 text-sm text-muted">{partner.website_url ?? "—"}</td>
                    <td className="p-3 text-sm text-muted max-w-xs truncate">{partner.description ?? "—"}</td>
                    <td className="p-3 text-sm">{partner.is_active ? "✓" : "—"}</td>
                    <td className="p-3">
                      <div className="flex items-center gap-3">
                        <Link
                          href={`/admin/partners/${partner.id}/edit`}
                          className="text-sm text-accent hover:text-accent-deep"
                        >
                          Edit
                        </Link>
                        <DeleteButton id={partner.id} type="partner" title={partner.name} />
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}