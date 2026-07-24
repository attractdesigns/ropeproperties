import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Section } from "@/components/Section";
import { GalleryCarousel } from "@/components/GalleryCarousel";
import { InvestmentStatusBadge } from "@/components/StatusBadge";
import { AgentCard } from "@/components/AgentCard";
import { WhatsAppButton } from "@/components/WhatsAppButton";
import { InvestmentInterestForm } from "@/components/forms/InvestmentInterestForm";
import { createClient } from "@/lib/supabase/server";
import { getStorageUrl } from "@/lib/storage";
import { formatPriceCompact } from "@/lib/format";
import type { InvestmentWithRelations } from "@/lib/types";
import { MapPin, TrendingUp, Wallet, Clock, Building } from "lucide-react";

export const revalidate = 60;

async function getOpportunity(slug: string): Promise<InvestmentWithRelations | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("investment_opportunities")
    .select(`
      *,
      investment_images (*),
      agents (*)
    `)
    .eq("slug", slug)
    .neq("status", "draft")
    .single();
  return data as unknown as InvestmentWithRelations | null;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const opportunity = await getOpportunity(slug);
  if (!opportunity) return { title: "Opportunity Not Found" };

  const coverImage = opportunity.investment_images?.[0];
  const imageUrl = getStorageUrl(coverImage?.storage_path);

  return {
    title: opportunity.title,
    description: opportunity.description.slice(0, 160),
    openGraph: {
      title: opportunity.title,
      description: opportunity.description.slice(0, 160),
      images: imageUrl ? [{ url: imageUrl }] : undefined,
    },
  };
}

const typeLabels: Record<string, string> = {
  off_plan: "Off-Plan",
  land_banking: "Land Banking",
  buy_to_let: "Buy-to-Let",
  development: "Development",
  flip: "Flip",
};

export default async function OpportunityDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const opportunity = await getOpportunity(slug);
  if (!opportunity) notFound();

  const isClosed = opportunity.status === "closed";
  const location = [opportunity.neighbourhood, opportunity.city].filter(Boolean).join(", ");

  return (
    <>
      <Header />
      <main className="pt-16">
        <Section>
          {/* Gallery */}
          <GalleryCarousel
            images={opportunity.investment_images}
          />

          {/* Header */}
          <div className="mt-8">
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className="inline-flex items-center px-2.5 py-1 text-xs font-medium uppercase tracking-wide bg-accent-tint text-accent-deep">
                {typeLabels[opportunity.investment_type] ?? opportunity.investment_type}
              </span>
              <InvestmentStatusBadge status={opportunity.status} />
            </div>
            <h1 className="font-display text-3xl md:text-4xl font-medium text-ink">
              {opportunity.title}
            </h1>
            {location && (
              <p className="flex items-center gap-1 text-muted mt-2">
                <MapPin size={16} className="text-accent" />
                {location}
              </p>
            )}
          </div>

          {/* Key facts grid */}
          <div className="mt-8 grid grid-cols-2 md:grid-cols-5 gap-4 border-y border-line py-6">
            <FactItem icon={<Building size={18} />} label="Type" value={typeLabels[opportunity.investment_type] ?? opportunity.investment_type} />
            <FactItem icon={<MapPin size={18} />} label="Location" value={location} />
            <FactItem icon={<TrendingUp size={18} />} label="Projected ROI" value={opportunity.roi_range ?? "—"} />
            <FactItem icon={<Wallet size={18} />} label="Min Entry" value={opportunity.min_entry != null ? `From ${formatPriceCompact(opportunity.min_entry)}` : "—"} />
            <FactItem icon={<Clock size={18} />} label="Duration" value={opportunity.duration ?? "—"} />
          </div>

          {/* Description + sidebar */}
          <div className="mt-8 grid md:grid-cols-3 gap-8">
            <div className="md:col-span-2">
              <h2 className="font-display text-xl text-ink mb-3">About this opportunity</h2>
              <div className="text-muted leading-relaxed whitespace-pre-line">
                {opportunity.description}
              </div>

              {opportunity.map_embed_url && (
                <div className="mt-8">
                  <h2 className="font-display text-xl text-ink mb-4">Location</h2>
                  <div className="aspect-[16/9] border border-line">
                    <iframe
                      src={opportunity.map_embed_url}
                      className="w-full h-full"
                      loading="lazy"
                      title="Opportunity location"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              <AgentCard agent={opportunity.agents} context={opportunity.title} />

              {!isClosed && (
                <>
                  <WhatsAppButton
                    message={`Hello, I'm interested in "${opportunity.title}". Please get in touch.`}
                    label="WhatsApp Us"
                    variant="solid"
                    className="w-full justify-center"
                  />
                  <InvestmentInterestForm
                    opportunityId={opportunity.id}
                    opportunityTitle={opportunity.title}
                  />
                </>
              )}

              {isClosed && (
                <div className="border border-line p-6 text-center bg-surface">
                  <p className="text-muted">
                    This opportunity is now closed for investment.
                  </p>
                  <p className="text-sm text-muted mt-2">
                    Browse{" "}
                    <Link href="/invest" className="text-accent hover:text-accent-deep">
                      open opportunities
                    </Link>
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Disclaimer */}
          <div className="mt-12 border-l-2 border-accent pl-4 max-w-2xl">
            <p className="text-sm text-muted leading-relaxed">
              <strong className="text-ink">Disclaimer:</strong> Projected figures are
              indicative estimates, not guarantees. Investments carry risk. All terms,
              commitments, and payments are discussed directly with our team.
            </p>
          </div>
        </Section>
      </main>
      <Footer />
    </>
  );
}

function FactItem({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div>
      <div className="flex items-center gap-1.5 text-accent mb-1">{icon}</div>
      <p className="text-xs text-muted uppercase tracking-wide">{label}</p>
      <p className="text-sm text-ink font-medium mt-0.5">{value}</p>
    </div>
  );
}