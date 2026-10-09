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
import { gql } from "@/lib/nhost/gql";
import { getPrimaryRealtor } from "@/lib/realtor";
import { getStorageUrl } from "@/lib/storage";
import { formatPriceCompact } from "@/lib/format";
import { withImageSizes } from "@/lib/image-size";
import { MobileContactBar, InlineContactActions } from "@/components/MobileContactBar";
import { REALTOR_NAME } from "@/lib/site";
import type { InvestmentWithRelations } from "@/lib/types";
import { MapPin, TrendingUp, Wallet, Clock, Building } from "lucide-react";

export const revalidate = 60;

const INVESTMENT_FIELDS = /* GraphQL */ `
  id slug title description status investment_type city neighbourhood
  roi_range min_entry duration map_embed_url is_featured agent_id created_at updated_at
  advertised_returns
  investment_images(order_by: { sort_order: asc }) {
    id opportunity_id storage_path alt sort_order
  }
  agents: agent { id name role phone whatsapp email photo_path bio is_primary is_active sort_order }
`;

async function getOpportunity(slug: string): Promise<InvestmentWithRelations | null> {
  const data = await gql<{ investment_opportunities: InvestmentWithRelations[] }>(`
    query Opportunity($slug: String!) {
      investment_opportunities(
        where: { slug: { _eq: $slug }, status: { _neq: "draft" } }
        limit: 1
      ) { ${INVESTMENT_FIELDS} }
    }
  `, { slug });
  return data.investment_opportunities[0] ?? null;
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

  const [primaryRealtor, galleryImages] = await Promise.all([
    opportunity.agents ? null : getPrimaryRealtor(),
    withImageSizes(opportunity.investment_images),
  ]);
  const contact = opportunity.agents ?? primaryRealtor;
  const returns = opportunity.advertised_returns ?? [];

  const isClosed = opportunity.status === "closed";
  const location = [opportunity.neighbourhood, opportunity.city].filter(Boolean).join(", ");

  // Skip facts we have no value for rather than printing a dash.
  const facts = [
    { icon: <Building size={18} />, label: "Type", value: typeLabels[opportunity.investment_type] ?? opportunity.investment_type },
    { icon: <MapPin size={18} />, label: "Location", value: location },
    { icon: <TrendingUp size={18} />, label: "Projected ROI", value: opportunity.roi_range ?? "" },
    { icon: <Wallet size={18} />, label: "Min Entry", value: opportunity.min_entry != null ? `From ${formatPriceCompact(opportunity.min_entry)}` : "" },
    { icon: <Clock size={18} />, label: "Duration", value: opportunity.duration ?? "" },
  ].filter((f) => f.value);

  return (
    <>
      <Header />
      <main className="pt-16">
        <Section>
          <GalleryCarousel images={galleryImages} title={opportunity.title} />

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

          {!isClosed && (
            <InlineContactActions
              phone={contact?.phone ?? null}
              whatsapp={contact?.whatsapp ?? null}
              context={opportunity.title}
            />
          )}

          <div className="mt-8 grid grid-cols-2 gap-4 border-y border-line py-6 md:grid-cols-[repeat(auto-fit,minmax(130px,1fr))]">
            {facts.map((f) => (
              <FactItem key={f.label} icon={f.icon} label={f.label} value={f.value} />
            ))}
          </div>

          {returns.length > 0 && (
            <section
              aria-labelledby="returns-heading"
              className="mt-6 rounded-xl border border-accent/40 bg-accent-tint p-5"
            >
              <h2 id="returns-heading" className="font-display text-lg text-ink">
                Developer-advertised buyback returns
              </h2>
              <ul className="mt-3 grid grid-cols-3 gap-3 text-center">
                {returns.map((r) => (
                  <li key={r.term} className="rounded-lg bg-bg px-2 py-3">
                    <p className="font-display text-2xl text-accent">{r.return}</p>
                    <p className="mt-1 text-xs text-muted">after {r.term}</p>
                  </li>
                ))}
              </ul>
              <p className="mt-3 text-sm text-muted">
                These are the developer&apos;s advertised buyback figures, not guaranteed
                returns, and are subject to the developer&apos;s terms and conditions.
              </p>
            </section>
          )}

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

            <div className="space-y-6">
              <AgentCard
                agent={opportunity.agents ?? primaryRealtor}
                context={opportunity.title}
              />

              {!isClosed && (
                <>
                  <WhatsAppButton
                    message={`Hello, I'm interested in "${opportunity.title}". Please get in touch.`}
                    label={`WhatsApp ${REALTOR_NAME}`}
                    variant="solid"
                    className="hidden w-full justify-center md:inline-flex"
                  />
                  <InvestmentInterestForm
                    opportunityId={opportunity.id}
                    opportunityTitle={opportunity.title}
                  />
                </>
              )}

              {isClosed && (
                <div className="border border-line p-6 text-center bg-surface">
                  <p className="text-muted">This opportunity is now closed for investment.</p>
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

          <div className="mt-12 border-l-2 border-accent pl-4 max-w-2xl">
            <p className="text-sm text-muted leading-relaxed">
              <strong className="text-ink">Disclaimer:</strong> Projected figures are
              indicative estimates, not guarantees. Investments carry risk. All terms,
              commitments, and payments are discussed directly with me.
            </p>
          </div>
        </Section>
      </main>
      <Footer />
      {!isClosed && (
        <MobileContactBar
          phone={contact?.phone ?? null}
          whatsapp={contact?.whatsapp ?? null}
          context={opportunity.title}
        />
      )}
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
