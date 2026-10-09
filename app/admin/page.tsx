import Link from "next/link";
import { gql } from "@/lib/nhost/gql";
import { Phone } from "lucide-react";
import type { Inquiry } from "@/lib/types";

export const dynamic = "force-dynamic";

async function getStats() {
  const data = await gql<{
    published: { aggregate: { count: number } };
    drafts: { aggregate: { count: number } };
    openOpportunities: { aggregate: { count: number } };
    unreadInquiries: { aggregate: { count: number } };
    latestInquiries: Inquiry[];
  }>(`
    query DashboardStats {
      published: properties_aggregate(where: { status: { _neq: "draft" } }) {
        aggregate { count }
      }
      drafts: properties_aggregate(where: { status: { _eq: "draft" } }) {
        aggregate { count }
      }
      openOpportunities: investment_opportunities_aggregate(
        where: { status: { _in: ["open", "closing_soon"] } }
      ) {
        aggregate { count }
      }
      unreadInquiries: inquiries_aggregate(where: { is_read: { _eq: false } }) {
        aggregate { count }
      }
      latestInquiries: inquiries(
        order_by: { created_at: desc }
        limit: 5
      ) {
        id kind name phone message is_read created_at
        property_id opportunity_id
      }
    }
  `);

  return {
    published: data.published.aggregate.count,
    drafts: data.drafts.aggregate.count,
    openOpportunities: data.openOpportunities.aggregate.count,
    unreadInquiries: data.unreadInquiries.aggregate.count,
    latestInquiries: data.latestInquiries,
  };
}

const kindLabels: Record<string, string> = {
  contact: "Contact",
  viewing: "Viewing",
  investment: "Investment",
};

export default async function AdminDashboardPage() {
  const stats = await getStats();

  const statCards = [
    { label: "Published Listings", value: stats.published, href: "/admin/listings" },
    { label: "Drafts", value: stats.drafts, href: "/admin/listings" },
    { label: "Open Opportunities", value: stats.openOpportunities, href: "/admin/investments" },
    { label: "Unread Inquiries", value: stats.unreadInquiries, href: "/admin/inquiries" },
  ];

  return (
    <div>
      <h1 className="font-display text-2xl text-ink mb-6">Dashboard</h1>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {statCards.map((stat) => (
          <Link
            key={stat.label}
            href={stat.href}
            className="bg-white border border-line p-6 hover:border-accent transition-colors"
          >
            <p className="font-display text-3xl text-ink">{stat.value}</p>
            <p className="text-sm text-muted mt-1">{stat.label}</p>
          </Link>
        ))}
      </div>

      <div className="bg-white border border-line">
        <div className="flex items-center justify-between p-4 border-b border-line">
          <h2 className="font-display text-lg text-ink">Latest Inquiries</h2>
          <Link href="/admin/inquiries" className="text-sm text-accent hover:text-accent-deep">
            View all →
          </Link>
        </div>

        {stats.latestInquiries.length === 0 ? (
          <p className="p-8 text-center text-muted">No inquiries yet.</p>
        ) : (
          <div className="divide-y divide-line">
            {stats.latestInquiries.map((inquiry) => (
              <div key={inquiry.id} className="p-4 flex items-start gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-medium px-2 py-0.5 bg-accent-tint text-accent-deep uppercase">
                      {kindLabels[inquiry.kind] ?? inquiry.kind}
                    </span>
                    {!inquiry.is_read && (
                      <span className="w-2 h-2 rounded-full bg-accent" />
                    )}
                  </div>
                  <p className="text-sm font-medium text-ink">{inquiry.name}</p>
                  <p className="text-sm text-muted truncate">{inquiry.message}</p>
                </div>
                <div className="flex gap-2 shrink-0">
                  <a href={`tel:${inquiry.phone.replace(/\s/g, "")}`} className="text-muted hover:text-accent">
                    <Phone size={16} />
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
