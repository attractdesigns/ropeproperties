import Link from "next/link";
import { gql } from "@/lib/nhost/gql";
import { formatPhoneDisplay } from "@/lib/format";
import { Phone, MessageCircle } from "lucide-react";
import { InquiryReadToggle } from "@/components/admin/InquiryReadToggle";
import { DeleteButton } from "@/components/admin/DeleteButton";
import type { Inquiry } from "@/lib/types";

export const dynamic = "force-dynamic";

type InquiryRow = Inquiry & {
  properties: { title: string; slug: string } | null;
  investment_opportunities: { title: string; slug: string } | null;
};

const kindLabels: Record<string, string> = {
  contact: "Contact",
  viewing: "Viewing",
  investment: "Investment",
};

const kindColors: Record<string, string> = {
  contact: "bg-surface text-muted",
  viewing: "bg-accent-tint text-accent-deep",
  investment: "bg-accent text-white",
};

async function getInquiries(): Promise<InquiryRow[]> {
  const data = await gql<{ inquiries: InquiryRow[] }>(`
    query AdminInquiries {
      inquiries(order_by: { created_at: desc }) {
        id kind name phone email message preferred_date is_read created_at
        property_id opportunity_id
        properties: property { title slug }
        investment_opportunities: investment_opportunity { title slug }
      }
    }
  `);
  return data.inquiries;
}

export default async function AdminInquiriesPage() {
  const inquiries = await getInquiries();

  return (
    <div>
      <h1 className="font-display text-2xl text-ink mb-6">Inquiries</h1>

      <div className="bg-white border border-line overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-line text-left">
              <th className="p-3 text-xs font-medium text-muted uppercase">Kind</th>
              <th className="p-3 text-xs font-medium text-muted uppercase">Name</th>
              <th className="p-3 text-xs font-medium text-muted uppercase">Contact</th>
              <th className="p-3 text-xs font-medium text-muted uppercase">Related</th>
              <th className="p-3 text-xs font-medium text-muted uppercase">Message</th>
              <th className="p-3 text-xs font-medium text-muted uppercase">Date</th>
              <th className="p-3 text-xs font-medium text-muted uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {inquiries.length === 0 ? (
              <tr>
                <td colSpan={7} className="p-8 text-center text-muted">No inquiries yet.</td>
              </tr>
            ) : (
              inquiries.map((inquiry) => (
                <tr key={inquiry.id} className={inquiry.is_read ? "" : "bg-accent-tint/30"}>
                  <td className="p-3">
                    <span className={`text-xs font-medium px-2 py-0.5 uppercase ${kindColors[inquiry.kind] ?? ""}`}>
                      {kindLabels[inquiry.kind] ?? inquiry.kind}
                    </span>
                  </td>
                  <td className="p-3 text-sm font-medium text-ink">{inquiry.name}</td>
                  <td className="p-3 text-sm">
                    <div className="flex gap-2">
                      <a href={`tel:${inquiry.phone.replace(/\s/g, "")}`} className="text-muted hover:text-accent">
                        <Phone size={14} />
                      </a>
                      <a
                        href={`https://wa.me/${inquiry.phone.replace(/\D/g, "")}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-muted hover:text-accent"
                      >
                        <MessageCircle size={14} />
                      </a>
                      <span className="text-muted">{formatPhoneDisplay(inquiry.phone)}</span>
                    </div>
                  </td>
                  <td className="p-3 text-sm text-muted">
                    {inquiry.properties && (
                      <Link href={`/listings/${inquiry.properties.slug}`} className="text-accent hover:text-accent-deep">
                        {inquiry.properties.title}
                      </Link>
                    )}
                    {inquiry.investment_opportunities && (
                      <Link href={`/invest/${inquiry.investment_opportunities.slug}`} className="text-accent hover:text-accent-deep">
                        {inquiry.investment_opportunities.title}
                      </Link>
                    )}
                    {!inquiry.properties && !inquiry.investment_opportunities && "—"}
                  </td>
                  <td className="p-3 text-sm text-muted max-w-xs truncate">{inquiry.message}</td>
                  <td className="p-3 text-sm text-muted">{new Date(inquiry.created_at).toLocaleDateString()}</td>
                  <td className="p-3">
                    <div className="flex gap-2">
                      <InquiryReadToggle id={inquiry.id} isRead={inquiry.is_read} />
                      <DeleteButton id={inquiry.id} type="inquiry" title={`inquiry from ${inquiry.name}`} />
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
