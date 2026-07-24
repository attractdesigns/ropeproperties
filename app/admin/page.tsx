import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Phone } from "lucide-react";

export const dynamic = "force-dynamic";

async function getStats() {
  const supabase = await createClient();

  const [published, drafts, openOpportunities, unreadInquiries, latestInquiries] = await Promise.all([
    supabase.from("properties").select("id", { count: "exact", head: true }).neq("status", "draft"),
    supabase.from("properties").select("id", { count: "exact", head: true }).eq("status", "draft"),
    supabase.from("investment_opportunities").select("id", { count: "exact", head: true }).in("status", ["open", "closing_soon"]),
    supabase.from("inquiries").select("id", { count: "exact", head: true }).eq("is_read", false),
    supabase.from("inquiries").select("*").order("created_at", { ascending: false }).limit(5),
  ]);

  return {
    published: published.count ?? 0,
    drafts: drafts.count ?? 0,
    openOpportunities: openOpportunities.count ?? 0,
    unreadInquiries: unreadInquiries.count ?? 0,
    latestInquiries: latestInquiries.data ?? [],
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

      {/* Stat cards */}
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

      {/* Latest inquiries */}
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
                  <a
                    href={`tel:${inquiry.phone.replace(/\s/g, "")}`}
                    className="text-muted hover:text-accent"
                  >
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