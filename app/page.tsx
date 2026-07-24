import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Phone } from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Section, SectionTitle } from "@/components/Section";
import { PropertyCard } from "@/components/PropertyCard";
import { OpportunityCard } from "@/components/OpportunityCard";
import { WhatsAppButton } from "@/components/WhatsAppButton";
import { createClient } from "@/lib/supabase/server";
import type { PropertyWithRelations, InvestmentWithRelations } from "@/lib/types";

export const revalidate = 60;

async function getFeaturedProperties() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("properties")
    .select(`
      *,
      property_images (*),
      agents (*),
      partner_companies (*)
    `)
    .eq("is_featured", true)
    .neq("status", "draft")
    .order("created_at", { ascending: false })
    .limit(6);
  return (data ?? []) as unknown as PropertyWithRelations[];
}

async function getFeaturedOpportunities() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("investment_opportunities")
    .select(`
      *,
      investment_images (*),
      agents (*)
    `)
    .in("status", ["open", "closing_soon"])
    .order("created_at", { ascending: false })
    .limit(3);
  return (data ?? []) as unknown as InvestmentWithRelations[];
}

const services = [
  { title: "Buy", description: "Find your dream home", href: "/listings?status=for_sale" },
  { title: "Rent", description: "Premium rentals", href: "/listings?status=for_rent" },
  { title: "Invest", description: "Grow your wealth", href: "/invest" },
  { title: "Sell / Manage", description: "List & manage property", href: "/contact" },
];

export default function HomePage() {
  return (
    <>
      <Header />
      <main>
        {/* Hero */}
        <section className="relative h-screen min-h-[600px] w-full">
          <Image
            src="https://picsum.photos/seed/ropeproperties-hero/1920/1080"
            alt="Premium property"
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/20 to-black/40" />
          <div className="relative h-full flex items-center justify-center text-center px-4">
            <div className="max-w-2xl">
              <h1 className="font-display text-4xl md:text-6xl text-white font-medium leading-tight">
                Find a place you&apos;ll love to call home
              </h1>
              <p className="mt-6 text-white/80 text-lg max-w-md mx-auto">
                Premium Nigerian real estate — buy, rent, and invest with confidence.
              </p>
              <Link
                href="/listings"
                className="mt-8 inline-flex items-center gap-2 bg-white text-ink px-6 py-3 text-sm font-medium hover:bg-accent hover:text-white transition-colors"
              >
                Browse Listings
                <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </section>

        {/* Featured Listings */}
        <FeaturedProperties />

        {/* About Teaser */}
        <Section background="surface">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="aspect-[4/3] relative bg-surface border border-line">
              <Image
                src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&q=80"
                alt="RopeProperties office"
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover"
              />
            </div>
            <div>
              <SectionTitle>About RopeProperties</SectionTitle>
              <p className="mt-4 text-muted leading-relaxed">
                A Lagos-based real estate firm helping clients buy, rent, and invest
                in premium Nigerian property since 2015. We combine deep local
                expertise with a long-term view — so you can make confident decisions.
              </p>
              <Link
                href="/about"
                className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-accent hover:text-accent-deep transition-colors"
              >
                Our Story
                <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </Section>

        {/* Services Strip */}
        <Section>
          <SectionTitle align="center" className="mb-12">
            How we can help
          </SectionTitle>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {services.map((service) => (
              <Link
                key={service.title}
                href={service.href}
                className="group border border-line p-6 hover:border-accent transition-colors text-center"
              >
                <h3 className="font-display text-xl text-ink group-hover:text-accent transition-colors">
                  {service.title}
                </h3>
                <p className="mt-2 text-sm text-muted">{service.description}</p>
              </Link>
            ))}
          </div>
        </Section>

        {/* Investment Teaser */}
        <InvestmentTeaser />

        {/* CTA Band */}
        <Section background="surface">
          <div className="text-center max-w-xl mx-auto">
            <SectionTitle>Looking for something specific?</SectionTitle>
            <p className="mt-4 text-muted">
              Tell us what you need — we&apos;ll find it.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-4">
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 bg-ink text-white px-6 py-3 text-sm font-medium hover:bg-accent transition-colors"
              >
                <Phone size={16} />
                Contact Us
              </Link>
              <WhatsAppButton label="WhatsApp Us" variant="outline" />
            </div>
          </div>
        </Section>
      </main>
      <Footer />
    </>
  );
}

async function FeaturedProperties() {
  const properties = await getFeaturedProperties();

  if (properties.length === 0) return null;

  return (
    <Section>
      <div className="flex items-baseline justify-between mb-10">
        <SectionTitle>Featured Listings</SectionTitle>
        <Link
          href="/listings"
          className="text-sm font-medium text-accent hover:text-accent-deep transition-colors"
        >
          View all →
        </Link>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-10">
        {properties.map((property) => (
          <PropertyCard key={property.id} property={property} />
        ))}
      </div>
    </Section>
  );
}

async function InvestmentTeaser() {
  const opportunities = await getFeaturedOpportunities();

  if (opportunities.length === 0) return null;

  return (
    <Section background="surface">
      <div className="flex items-baseline justify-between mb-10">
        <SectionTitle>Investment Opportunities</SectionTitle>
        <Link
          href="/invest"
          className="text-sm font-medium text-accent hover:text-accent-deep transition-colors"
        >
          Explore investments →
        </Link>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-10">
        {opportunities.map((opp) => (
          <OpportunityCard key={opp.id} opportunity={opp} />
        ))}
      </div>
    </Section>
  );
}