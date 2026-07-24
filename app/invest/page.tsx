import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Section, SectionTitle } from "@/components/Section";
import { OpportunityCard } from "@/components/OpportunityCard";
import { PropertyCard } from "@/components/PropertyCard";
import { createClient } from "@/lib/supabase/server";
import type {
  InvestmentWithRelations,
  PropertyWithRelations,
  InvestmentStatus,
} from "@/lib/types";

export const revalidate = 60;

async function getOpportunities() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("investment_opportunities")
    .select(`
      *,
      investment_images (*),
      agents (*)
    `)
    .neq("status", "draft")
    .order("created_at", { ascending: false });
  return (data ?? []) as unknown as InvestmentWithRelations[];
}

async function getInvestmentListings() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("properties")
    .select(`
      *,
      property_images (*),
      agents (*),
      partner_companies (*)
    `)
    .eq("is_investment", true)
    .neq("status", "draft")
    .order("created_at", { ascending: false });
  return (data ?? []) as unknown as PropertyWithRelations[];
}

const steps = [
  { number: "1", title: "Enquire", description: "Tell us your goals and budget — we'll match you with the right opportunity." },
  { number: "2", title: "Meet the team", description: "We'll walk you through the details, answer your questions, and share projections." },
  { number: "3", title: "Invest offline", description: "All commitments and payments happen directly with us — no online transactions." },
];

export default async function InvestPage() {
  const [opportunities, investmentListings] = await Promise.all([
    getOpportunities(),
    getInvestmentListings(),
  ]);

  // Sort: open/closing_soon first, then closed
  const order: Record<InvestmentStatus, number> = {
    open: 0,
    closing_soon: 1,
    closed: 2,
    draft: 3, // never published, but keeps the map exhaustive
  };
  const sorted = [...opportunities].sort((a, b) => order[a.status] - order[b.status]);

  return (
    <>
      <Header />
      <main className="pt-16">
        {/* Intro */}
        <Section>
          <div className="max-w-2xl">
            <SectionTitle>Invest with RopeProperties</SectionTitle>
            <p className="mt-4 text-muted leading-relaxed">
              We package premium Nigerian real estate investment opportunities — from
              off-plan developments to land banking and buy-to-let deals. Our team
              helps you identify, evaluate, and commit to opportunities that align with
              your goals.
            </p>
          </div>

          {/* How it works */}
          <div className="mt-12 grid md:grid-cols-3 gap-8">
            {steps.map((step) => (
              <div key={step.number}>
                <div className="font-display text-3xl text-accent mb-2">{step.number}</div>
                <h3 className="font-display text-lg text-ink mb-2">{step.title}</h3>
                <p className="text-sm text-muted leading-relaxed">{step.description}</p>
              </div>
            ))}
          </div>
        </Section>

        {/* Opportunities grid */}
        {sorted.length > 0 && (
          <Section background="surface">
            <SectionTitle className="mb-10">Investment Opportunities</SectionTitle>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-10">
              {sorted.map((opp) => (
                <OpportunityCard key={opp.id} opportunity={opp} />
              ))}
            </div>
          </Section>
        )}

        {/* Investment-grade listings */}
        {investmentListings.length > 0 && (
          <Section>
            <SectionTitle className="mb-10">Investment-Grade Listings</SectionTitle>
            <p className="text-muted mb-8 max-w-xl">
              These featured listings have been flagged as investment-worthy, with
              strong rental or appreciation potential.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-10">
              {investmentListings.map((property) => (
                <PropertyCard key={property.id} property={property} />
              ))}
            </div>
          </Section>
        )}

        {/* Disclaimer */}
        <Section background="surface">
          <div className="border-l-2 border-accent pl-4 max-w-2xl">
            <p className="text-sm text-muted leading-relaxed">
              <strong className="text-ink">Disclaimer:</strong> Projected figures are
              indicative estimates, not guarantees. Investments carry risk. All terms,
              commitments, and payments are discussed directly with our team — no
              transactions are processed on this website.
            </p>
          </div>
        </Section>
      </main>
      <Footer />
    </>
  );
}