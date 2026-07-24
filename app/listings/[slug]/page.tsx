import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Section } from "@/components/Section";
import { GalleryCarousel } from "@/components/GalleryCarousel";
import { StatusBadge, InvestmentBadge } from "@/components/StatusBadge";
import { AgentCard } from "@/components/AgentCard";
import { ViewingForm } from "@/components/forms/ViewingForm";
import { WhatsAppButton } from "@/components/WhatsAppButton";
import { createClient } from "@/lib/supabase/server";
import { getStorageUrl } from "@/lib/storage";
import { formatPriceWithPeriod } from "@/lib/format";
import type { PropertyWithRelations } from "@/lib/types";
import { Check, MapPin, ExternalLink } from "lucide-react";

export const revalidate = 60;

async function getProperty(slug: string): Promise<PropertyWithRelations | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("properties")
    .select(`
      *,
      property_images (*),
      agents (*),
      partner_companies (*)
    `)
    .eq("slug", slug)
    .neq("status", "draft")
    .single();
  return data as unknown as PropertyWithRelations | null;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const property = await getProperty(slug);
  if (!property) return { title: "Property Not Found" };

  const coverImage = property.property_images?.[0];
  const imageUrl = getStorageUrl(coverImage?.storage_path);

  return {
    title: property.title,
    description: property.description.slice(0, 160),
    openGraph: {
      title: property.title,
      description: property.description.slice(0, 160),
      images: imageUrl ? [{ url: imageUrl }] : undefined,
    },
  };
}

export default async function PropertyDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const property = await getProperty(slug);
  if (!property) notFound();

  const isSoldOrLet = property.status === "sold" || property.status === "let";
  const location = [property.neighbourhood, property.city].filter(Boolean).join(", ");

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "RealEstateListing",
    name: property.title,
    description: property.description,
    url: `https://ropeproperties.com/listings/${property.slug}`,
    price: property.price,
    priceCurrency: "NGN",
    address: {
      "@type": "PostalAddress",
      addressLocality: property.neighbourhood ?? property.city,
      addressRegion: property.city,
      addressCountry: "NG",
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Header />
      <main className="pt-16">
        <Section>
          {/* Gallery */}
          <GalleryCarousel
            images={property.property_images}
          />

          {/* Header row */}
          <div className="mt-8 flex flex-col md:flex-row md:items-start md:justify-between gap-4">
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <StatusBadge status={property.status} />
                {property.is_investment && <InvestmentBadge />}
              </div>
              <h1 className="font-display text-3xl md:text-4xl font-medium text-ink">
                {property.title}
              </h1>
              {location && (
                <p className="flex items-center gap-1 text-muted mt-2">
                  <MapPin size={16} className="text-accent" />
                  {location}
                </p>
              )}
              {property.is_investment && property.investment_note && (
                <p className="mt-2 text-sm text-accent-deep">{property.investment_note}</p>
              )}
            </div>
            <div className="text-right">
              <p className="font-display text-3xl text-accent">
                {formatPriceWithPeriod(property.price, property.price_period)}
              </p>
            </div>
          </div>

          {/* Partner attribution */}
          {property.partner_companies && (
            <div className="mt-4 flex items-center gap-2 text-sm text-muted">
              <span>Listed by</span>
              <span className="font-medium text-ink">{property.partner_companies.name}</span>
              {property.partner_companies.website_url && (
                <a
                  href={property.partner_companies.website_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-accent hover:text-accent-deep inline-flex items-center gap-1"
                >
                  Website <ExternalLink size={12} />
                </a>
              )}
            </div>
          )}

          {/* Spec grid */}
          <div className="mt-8 grid grid-cols-3 md:grid-cols-6 gap-4 border-y border-line py-6">
            <SpecItem label="Beds" value={property.bedrooms} />
            <SpecItem label="Baths" value={property.bathrooms} />
            <SpecItem label="Toilets" value={property.toilets} />
            <SpecItem label="Parking" value={property.parking} />
            <SpecItem label="Size" value={property.size_sqm ? `${property.size_sqm} m²` : null} />
            <SpecItem label="Type" value={formatType(property.property_type)} />
          </div>

          {/* Description + Features */}
          <div className="mt-8 grid md:grid-cols-3 gap-8">
            <div className="md:col-span-2">
              <h2 className="font-display text-xl text-ink mb-3">Description</h2>
              <div className="text-muted leading-relaxed whitespace-pre-line">
                {property.description}
              </div>

              {property.features.length > 0 && (
                <div className="mt-8">
                  <h2 className="font-display text-xl text-ink mb-4">Features & Amenities</h2>
                  <div className="grid grid-cols-2 gap-2">
                    {property.features.map((feature) => (
                      <div key={feature} className="flex items-center gap-2 text-sm text-ink">
                        <Check size={16} className="text-accent shrink-0" />
                        {feature}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Map */}
              {property.map_embed_url && (
                <div className="mt-8">
                  <h2 className="font-display text-xl text-ink mb-4">Location</h2>
                  <div className="aspect-[16/9] border border-line">
                    <iframe
                      src={property.map_embed_url}
                      className="w-full h-full"
                      loading="lazy"
                      title="Property location"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar: Agent + Form */}
            <div className="space-y-6">
              <AgentCard agent={property.agents} context={property.title} />

              {property.is_investment && (
                <WhatsAppButton
                  message={`Hello, I'm interested in investing in "${property.title}". Please get in touch.`}
                  label="Enquire about investing"
                  variant="solid"
                  className="w-full justify-center"
                />
              )}

              {!isSoldOrLet && (
                <ViewingForm
                  propertyId={property.id}
                  propertyTitle={property.title}
                  isInvestment={property.is_investment}
                />
              )}

              {isSoldOrLet && (
                <div className="border border-line p-6 text-center bg-surface">
                  <p className="text-muted">
                    This property is no longer available.
                  </p>
                  <p className="text-sm text-muted mt-2">
                    Browse{" "}
                    <Link href="/listings" className="text-accent hover:text-accent-deep">
                      available listings
                    </Link>
                  </p>
                </div>
              )}
            </div>
          </div>
        </Section>
      </main>
      <Footer />
    </>
  );
}

function SpecItem({ label, value }: { label: string; value: number | string | null }) {
  return (
    <div className="text-center">
      <p className="font-display text-xl text-ink">{value ?? "—"}</p>
      <p className="text-xs text-muted uppercase tracking-wide mt-1">{label}</p>
    </div>
  );
}

function formatType(type: string): string {
  return type.split("_").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
}