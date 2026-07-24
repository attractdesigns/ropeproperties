import Image from "next/image";
import { Phone, Mail, ExternalLink, Quote } from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Section, SectionTitle } from "@/components/Section";
import { WhatsAppButton } from "@/components/WhatsAppButton";
import { createClient } from "@/lib/supabase/server";
import { getStorageUrl } from "@/lib/storage";
import { getPrimaryRealtor, getSupportStaff, getTestimonials } from "@/lib/realtor";
import { formatPhoneDisplay } from "@/lib/format";
import { REALTOR_NAME, BUSINESS_NAME } from "@/lib/site";
import type { PartnerCompany } from "@/lib/types";

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

export const metadata = {
  title: `About ${REALTOR_NAME}`,
  description: `Meet ${REALTOR_NAME}, the realtor behind ${BUSINESS_NAME} — how I work, who I work with, and what my clients say.`,
};

export default async function AboutPage() {
  const [realtor, support, testimonials, partners] = await Promise.all([
    getPrimaryRealtor(),
    getSupportStaff(),
    getTestimonials(),
    getPartners(),
  ]);

  const portraitUrl = getStorageUrl(realtor?.photo_path);

  return (
    <>
      <Header />
      <main className="pt-16">
        {/* Personal story */}
        <Section>
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="aspect-[4/5] relative bg-surface border border-line">
              {portraitUrl ? (
                <Image
                  src={portraitUrl}
                  alt={realtor?.name ?? REALTOR_NAME}
                  fill
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className="object-cover"
                  priority
                />
              ) : (
                // TODO: client to supply a portrait of Opeoluwa — upload it to the
                // primary realtor's profile under Admin → Agents.
                <div className="w-full h-full flex items-center justify-center font-display text-6xl text-muted">
                  {REALTOR_NAME.charAt(0)}
                </div>
              )}
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-accent mb-3">
                {realtor?.role ?? "Realtor"}
              </p>
              <SectionTitle>Hello, I&apos;m {REALTOR_NAME}</SectionTitle>

              {/* TODO: client to edit this story in her own words. */}
              <p className="mt-4 text-muted leading-relaxed">
                {BUSINESS_NAME} is built on my name — <strong className="text-ink">R.O.P.E.</strong>{" "}
                comes from Opeoluwa. That is deliberate: when you work with me, you are
                not passed between departments or handed to whoever is free. You deal
                with me.
              </p>
              <p className="mt-4 text-muted leading-relaxed">
                I have spent my career in the Lagos property market — Lekki, Ikoyi,
                Victoria Island, and increasingly Abuja. I know which estates hold their
                value, which titles are worth the paperwork, and which deals are best
                walked away from. I would rather lose a sale than put a client into the
                wrong property.
              </p>
              <p className="mt-4 text-muted leading-relaxed">
                Whether you are buying your first home, renting while you settle into the
                city, or putting money to work in an investment, my job is to give you a
                straight answer and see it through to handover.
              </p>

              <div className="mt-8 flex flex-wrap items-center gap-3">
                {realtor?.phone && (
                  <a
                    href={`tel:${realtor.phone.replace(/\s/g, "")}`}
                    className="inline-flex items-center gap-2 bg-ink text-white px-5 py-2.5 text-sm font-medium hover:bg-accent transition-colors"
                  >
                    <Phone size={16} />
                    {formatPhoneDisplay(realtor.phone)}
                  </a>
                )}
                <WhatsAppButton
                  phone={realtor?.whatsapp ?? realtor?.phone ?? undefined}
                  message={`Hello ${REALTOR_NAME}, I'd like to talk about a property.`}
                  label={`WhatsApp ${REALTOR_NAME}`}
                  variant="outline"
                />
              </div>
            </div>
          </div>
        </Section>

        {/* Testimonials */}
        {testimonials.length > 0 && (
          <Section background="surface">
            <SectionTitle className="mb-10">What my clients say</SectionTitle>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {testimonials.map((t) => (
                <figure key={t.id} className="border border-line bg-white p-6 flex flex-col">
                  <Quote size={20} className="text-accent shrink-0" aria-hidden />
                  <blockquote className="mt-4 text-muted leading-relaxed flex-1">
                    {t.quote}
                  </blockquote>
                  <figcaption className="mt-5 pt-4 border-t border-line">
                    <p className="text-sm font-medium text-ink">{t.client_name}</p>
                    {t.location && (
                      <p className="text-xs text-muted mt-0.5">{t.location}</p>
                    )}
                  </figcaption>
                </figure>
              ))}
            </div>
          </Section>
        )}

        {/* Support staff — deliberately quieter than the realtor's own profile */}
        {support.length > 0 && (
          <Section>
            <SectionTitle className="mb-3">Working with me</SectionTitle>
            <p className="text-muted mb-10 max-w-xl">
              A small team supports the day-to-day — viewings, paperwork, and keeping
              things moving — so that nothing waits on one diary.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {support.map((agent) => {
                const photoUrl = getStorageUrl(agent.photo_path);
                return (
                  <div
                    key={agent.id}
                    className="border border-line p-5 flex items-center gap-4"
                  >
                    <div className="relative w-14 h-14 shrink-0 bg-surface border border-line overflow-hidden rounded-full">
                      {photoUrl ? (
                        <Image
                          src={photoUrl}
                          alt={agent.name}
                          fill
                          sizes="56px"
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center font-display text-xl text-muted">
                          {agent.name.charAt(0)}
                        </div>
                      )}
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-medium text-ink truncate">{agent.name}</h3>
                      <p className="text-sm text-muted">{agent.role}</p>
                      <div className="mt-2 flex gap-3">
                        {agent.phone && (
                          <a
                            href={`tel:${agent.phone.replace(/\s/g, "")}`}
                            className="text-muted hover:text-accent transition-colors"
                            aria-label={`Call ${agent.name}`}
                          >
                            <Phone size={15} />
                          </a>
                        )}
                        {agent.email && (
                          <a
                            href={`mailto:${agent.email}`}
                            className="text-muted hover:text-accent transition-colors"
                            aria-label={`Email ${agent.name}`}
                          >
                            <Mail size={15} />
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </Section>
        )}

        {/* Partners */}
        {partners.length > 0 && (
          <Section background="surface" id="partners">
            <SectionTitle className="mb-4">Who I work with</SectionTitle>
            <p className="text-muted mb-10 max-w-xl">
              Alongside my own listings, I market select properties from trusted partner
              firms across Nigeria — which means I can show you more of the market
              without you having to shop around.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {partners.map((partner) => {
                const logoUrl = getStorageUrl(partner.logo_path);
                return (
                  <div key={partner.id} className="border border-line p-6 bg-white">
                    {logoUrl ? (
                      <div className="relative h-12 mb-4">
                        <Image
                          src={logoUrl}
                          alt={partner.name}
                          fill
                          sizes="200px"
                          className="object-contain object-left"
                        />
                      </div>
                    ) : (
                      <p className="font-display text-xl text-ink mb-4">{partner.name}</p>
                    )}
                    {partner.description && (
                      <p className="text-sm text-muted">{partner.description}</p>
                    )}
                    {partner.website_url && (
                      <a
                        href={partner.website_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-3 inline-flex items-center gap-1 text-sm text-accent hover:text-accent-deep"
                      >
                        Visit website <ExternalLink size={12} />
                      </a>
                    )}
                  </div>
                );
              })}
            </div>
          </Section>
        )}
      </main>
      <Footer />
    </>
  );
}
