import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Phone, Quote } from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Section, SectionTitle } from "@/components/Section";
import { PropertyCard } from "@/components/PropertyCard";
import { OpportunityCard } from "@/components/OpportunityCard";
import { WhatsAppButton } from "@/components/WhatsAppButton";
import { PartnerModal } from "@/components/PartnerModal";
import { createClient } from "@/lib/supabase/server";
import { getTestimonials, getPrimaryRealtor } from "@/lib/realtor";
import { getStorageUrl } from "@/lib/storage";
import { getSiteSettings, HERO_DEFAULTS } from "@/lib/settings";
import { REALTOR_NAME, BUSINESS_NAME } from "@/lib/site";
import type { PropertyWithRelations, InvestmentWithRelations, PartnerCompany } from "@/lib/types";

export const revalidate = 60;

async function getPartners(): Promise<PartnerCompany[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("partner_companies")
    .select("*")
    .eq("is_active", true)
    .order("sort_order", { ascending: true });
  return data ?? [];
}

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
        <Hero />

        {/* Featured Listings */}
        <FeaturedProperties />

        {/* About Teaser */}
        <AboutTeaser />

        {/* Services Strip */}
        <Section>
          <SectionTitle align="center" className="mb-12">
            How I can help
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

        {/* Partners */}
        <Partners />

        {/* Social proof */}
        <Testimonials />

        {/* CTA Band */}
        <Section background="surface">
          <div className="text-center max-w-xl mx-auto">
            <SectionTitle>Looking for something specific?</SectionTitle>
            <p className="mt-4 text-muted">
              Tell me what you need and I&apos;ll find it — or tell you honestly if it
              isn&apos;t out there.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-4">
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 bg-ink text-white px-6 py-3 text-sm font-medium hover:bg-accent transition-colors"
              >
                <Phone size={16} />
                Get in touch
              </Link>
              <WhatsAppButton
                label={`WhatsApp ${REALTOR_NAME}`}
                variant="outline"
                message={`Hello ${REALTOR_NAME}, I'd like to talk about a property.`}
              />
            </div>
          </div>
        </Section>
      </main>
      <Footer />
    </>
  );
}

async function Hero() {
  // Image and copy come from Admin → Site settings; HERO_DEFAULTS keeps the
  // homepage intact if the row is empty or the migration hasn't been run.
  const settings = await getSiteSettings();

  const imageUrl =
    getStorageUrl(settings?.hero_image_path) ?? HERO_DEFAULTS.imageUrl;
  const heading = settings?.hero_heading?.trim() || HERO_DEFAULTS.heading;
  const subheading = settings?.hero_subheading?.trim() || HERO_DEFAULTS.subheading;

  return (
    <section className="relative h-screen min-h-[600px] w-full">
      <Image
        src={imageUrl}
        alt={heading}
        fill
        priority
        sizes="100vw"
        className="object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/20 to-black/40" />
      <div className="relative h-full flex items-center justify-center text-center px-4">
        <div className="max-w-2xl">
          <h1 className="font-display text-4xl md:text-6xl text-white font-medium leading-tight">
            {heading}
          </h1>
          <p className="mt-6 text-white/80 text-lg max-w-md mx-auto">{subheading}</p>
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

async function AboutTeaser() {
  // Uses the primary realtor's uploaded portrait so this and the About page can
  // never drift apart — changing the photo in Admin → Agents updates both.
  const realtor = await getPrimaryRealtor();
  const portraitUrl = getStorageUrl(realtor?.photo_path);

  return (
    <Section background="surface">
      <div className="grid md:grid-cols-2 gap-12 items-center">
        <div className="aspect-[4/5] relative bg-surface border border-line">
          {portraitUrl ? (
            <Image
              src={portraitUrl}
              alt={realtor?.name ?? REALTOR_NAME}
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover"
            />
          ) : (
            // No portrait uploaded yet — upload one under Admin → Agents.
            <div className="w-full h-full flex items-center justify-center font-display text-6xl text-muted">
              {REALTOR_NAME.charAt(0)}
            </div>
          )}
        </div>
        <div>
          <SectionTitle>Hello, I&apos;m {REALTOR_NAME}</SectionTitle>
          <p className="mt-4 text-muted leading-relaxed">
            {BUSINESS_NAME} is built on my name — R.O.P.E. comes from Opeoluwa. I
            help clients buy, rent, and invest across Lagos and Abuja, and I handle
            my clients personally, from first viewing through to handover.
          </p>
          <Link
            href="/about"
            className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-accent hover:text-accent-deep transition-colors"
          >
            More about me
            <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </Section>
  );
}

async function Testimonials() {
  const testimonials = (await getTestimonials()).slice(0, 3);

  if (testimonials.length === 0) return null;

  return (
    <Section>
      <SectionTitle align="center" className="mb-10">
        What my clients say
      </SectionTitle>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {testimonials.map((t) => (
          <figure key={t.id} className="border border-line p-6 flex flex-col">
            <Quote size={20} className="text-accent shrink-0" aria-hidden />
            <blockquote className="mt-4 text-muted leading-relaxed flex-1">
              {t.quote}
            </blockquote>
            <figcaption className="mt-5 pt-4 border-t border-line">
              <p className="text-sm font-medium text-ink">{t.client_name}</p>
              {t.location && <p className="text-xs text-muted mt-0.5">{t.location}</p>}
            </figcaption>
          </figure>
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

async function Partners() {
  const partners = await getPartners();

  if (partners.length === 0) return null;

  return (
    <Section>
      <div className="text-center max-w-xl mx-auto mb-10">
        <p className="text-xs uppercase tracking-[0.2em] text-accent mb-3">
          In partnership with
        </p>
        <SectionTitle>Trusted names I work alongside</SectionTitle>
        <p className="mt-4 text-muted">
          Alongside my own listings, I market select properties from trusted partner
          firms across Nigeria.
        </p>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
        {partners.map((partner) => {
          const logoUrl = getStorageUrl(partner.logo_path);
          return (
            <div
              key={partner.id}
              className="group border border-line bg-white p-6 flex flex-col"
            >
              <div className="relative h-12 mb-4">
                {logoUrl ? (
                  <Image
                    src={logoUrl}
                    alt={partner.name}
                    fill
                    sizes="200px"
                    className="object-contain object-left grayscale group-hover:grayscale-0 transition-[filter] duration-300"
                  />
                ) : (
                  <p className="font-display text-xl text-ink">{partner.name}</p>
                )}
              </div>
              <h3 className="font-medium text-ink">{partner.name}</h3>
              {partner.description && (
                <p className="mt-1 text-sm text-muted line-clamp-2">
                  {partner.description}
                </p>
              )}
              <PartnerModal partner={partner} />
            </div>
          );
        })}
      </div>
    </Section>
  );
}