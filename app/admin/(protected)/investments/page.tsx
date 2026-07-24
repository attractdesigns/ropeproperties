import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/lib/supabase/server";
import { getStorageUrl } from "@/lib/storage";
import { formatPriceCompact } from "@/lib/format";
import { InvestmentStatusBadge } from "@/components/StatusBadge";
import { DeleteButton } from "@/components/admin/DeleteButton";
import type { InvestmentOpportunity, InvestmentImage } from "@/lib/types";

export const dynamic = "force-dynamic";

const typeLabels: Record<string, string> = {
  off_plan: "Off-Plan",
  land_banking: "Land Banking",
  buy_to_let: "Buy-to-Let",
  development: "Development",
  flip: "Flip",
};

async function getOpportunities() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("investment_opportunities")
    .select(`
      id, title, slug, status, investment_type, roi_range, min_entry, city, is_featured, updated_at,
      investment_images (*)
    `)
    .order("updated_at", { ascending: false });
  return data ?? [];
}

export default async function AdminInvestmentsPage() {
  const opportunities = await getOpportunities();

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-2xl text-ink">Investments</h1>
        <Link
          href="/admin/investments/new"
          className="bg-ink text-white px-4 py-2 text-sm font-medium hover:bg-accent transition-colors"
        >
          + New Opportunity
        </Link>
      </div>

      <div className="bg-white border border-line overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-line text-left">
              <th className="p-3 text-xs font-medium text-muted uppercase">Image</th>
              <th className="p-3 text-xs font-medium text-muted uppercase">Title</th>
              <th className="p-3 text-xs font-medium text-muted uppercase">Type</th>
              <th className="p-3 text-xs font-medium text-muted uppercase">Status</th>
              <th className="p-3 text-xs font-medium text-muted uppercase">ROI</th>
              <th className="p-3 text-xs font-medium text-muted uppercase">Min Entry</th>
              <th className="p-3 text-xs font-medium text-muted uppercase">City</th>
              <th className="p-3 text-xs font-medium text-muted uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {opportunities.length === 0 ? (
              <tr>
                <td colSpan={8} className="p-8 text-center text-muted">
                  No opportunities yet.{" "}
                  <Link href="/admin/investments/new" className="text-accent hover:text-accent-deep">
                    Create one
                  </Link>
                </td>
              </tr>
            ) : (
              opportunities.map((opp) => {
                const o = opp as unknown as InvestmentOpportunity & { investment_images: InvestmentImage[] };
                const coverImage = o.investment_images?.[0];
                const imageUrl = getStorageUrl(coverImage?.storage_path);
                return (
                  <tr key={o.id} className="hover:bg-surface">
                    <td className="p-3">
                      <div className="relative w-12 h-12 bg-surface border border-line">
                        {imageUrl && (
                          <Image src={imageUrl} alt={o.title} fill sizes="48px" className="object-cover" />
                        )}
                      </div>
                    </td>
                    <td className="p-3">
                      <Link href={`/admin/investments/${o.id}/edit`} className="text-sm text-ink hover:text-accent">
                        {o.title}
                      </Link>
                    </td>
                    <td className="p-3 text-sm text-muted">{typeLabels[o.investment_type] ?? o.investment_type}</td>
                    <td className="p-3"><InvestmentStatusBadge status={o.status} /></td>
                    <td className="p-3 text-sm text-muted">{o.roi_range ?? "—"}</td>
                    <td className="p-3 text-sm text-muted">
                      {o.min_entry != null ? `From ${formatPriceCompact(o.min_entry)}` : "—"}
                    </td>
                    <td className="p-3 text-sm text-muted">{o.city}</td>
                    <td className="p-3">
                      <div className="flex gap-2">
                        <Link href={`/admin/investments/${o.id}/edit`} className="text-sm text-accent hover:text-accent-deep">
                          Edit
                        </Link>
                        <DeleteButton id={o.id} type="opportunity" title={o.title} />
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