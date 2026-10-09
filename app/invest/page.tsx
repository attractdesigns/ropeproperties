import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Section, SectionTitle } from "@/components/Section";
import { OpportunityCard } from "@/components/OpportunityCard";
import { PropertyCard } from "@/components/PropertyCard";
import { gql } from "@/lib/nhost/gql";
import { REALTOR_NAME } from "@/lib/site";
import type {
  InvestmentWithRelations,
  PropertyWithRelations,
  InvestmentStatus,
} from "@/lib/types";

export const revalidate = 60;

const INVESTMENT_FIELDS = /* GraphQL */ `
  id slug title description status investment_type city neighbourhood
  roi_range min_entry duration map_embed_url is_featured agent_id created_at updated_at
  investment_images(order_by: { sort_order: asc }) {
    id opportunity_id storage_path alt sort_order
  }
  agents: agent { id name role phone whatsapp email photo_path bio is_primary is_active sort_order }
`;

const PROPERTY_FIELDS = /* GraphQL */ `
  id slug title description status property_type price price_period
  bedrooms bathrooms toilets parking size_sqm city neighbourhood
  features map_embed_url is_featured is_investment investment_note
  partner_id agent_id created_at updated_at
  property_images(order_by: { sort_order: asc }) {
    id property_id storage_path alt sort_order
  }
  agents: agent { id name role phone whatsapp email photo_path bio is_primary is_active sort_order }
  partner_companies: partner_company { id name description logo_path website_url is_active sort_order }
`;

async function getOpportunities(): Promise<InvestmentWithRelations[]> {
  const data = await gql<{ investment_opportunities: InvestmentWithRelations[] }>(`
    query Opportunities {
      investment_opportunities(
        where: { status: { _neq: "draft" } }
        order_by: { created_at: desc }
      ) { ${INVESTMENT_FIELDS} }
    }
  `);
  return data.investment_opportunities;
}

async function getInvestmentListings(): Promise<PropertyWithRelations[]> {
  const data = await gql<{ properties: PropertyWithRelations[] }>(`
    query InvestmentListings {
      properties(
        where: { is_investment: { _eq: true }, status: { _neq: "draft" } }
        order_by: { created_at: desc }
      ) { ${PROPERTY_FIELDS} }
    }
  `);
  return data.properties;
}

const steps = [
  { number: "1", title: "Enquire", description: "Tell me your goals and budget — I'll match you with the right opportunity." },
  { number: "2", title: "Meet me", description: "I'll walk you through the details, answer your questions, and share projections." },
  { number: "3", title: "Invest offline", description: "All commitments and payments happen directly with me — no online transactions." },
];

export default async function InvestPage() {
  const [opportunities, investmentListings] = await Promise.all([
    getOpportunities(),
    getInvestmentListings(),
  ]);

  const order: Record<InvestmentStatus, number> = {
    open: 0, closing_soon: 1, closed: 2, draft: 3,
  };
  const sorted = [...opportunities].sort((a, b) => order[a.status] - order[b.status]);

  return (
    <>
      <Header />
      <main className="pt-16">
        <Section>
          <div className="max-w-2xl">
            <SectionTitle>Invest with {REALTOR_NAME}</SectionTitle>
            <p className="mt-4 text-muted leading-relaxed">
              I package premium Nigerian real estate investment opportunities — from
              off-plan developments to land banking and buy-to-let deals — and I&apos;ll
              help you identify, evaluate, and commit to the ones that actually fit your
              goals.
            </p>
          </div>

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

        {investmentListings.length > 0 && (
          <Section>
            <SectionTitle className="mb-10">Investment-Grade Listings</SectionTitle>
            <p className="text-muted mb-8 max-w-xl">
              These featured listings have been flagged as investment-worthy, with
              strong yield or appreciation potential.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-10">
              {investmentListings.map((property) => (
                <PropertyCard key={property.id} property={property} />
              ))}
            </div>
          </Section>
        )}

        <Section background="surface">
          <div className="border-l-2 border-accent pl-4 max-w-2xl">
            <p className="text-sm text-muted leading-relaxed">
              <strong className="text-ink">Disclaimer:</strong> Projected figures are
              indicative estimates, not guarantees. Investments carry risk. All terms,
              commitments, and payments are discussed directly with me — no
              transactions are processed on this website.
            </p>
          </div>
        </Section>
      </main>
      <Footer />
    </>
  );
}
