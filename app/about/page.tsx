import Image from "next/image";
import { Phone, Mail, ExternalLink } from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Section, SectionTitle } from "@/components/Section";
import { createClient } from "@/lib/supabase/server";
import { getStorageUrl } from "@/lib/storage";
import type { Agent, PartnerCompany } from "@/lib/types";

export const revalidate = 60;

async function getAgents(): Promise<Agent[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("agents")
    .select("*")
    .eq("is_active", true)
    .order("sort_order", { ascending: true });
  return data ?? [];
}

async function getPartners(): Promise<PartnerCompany[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("partner_companies")
    .select("*")
    .eq("is_active", true)
    .order("sort_order", { ascending: true });
  return data ?? [];
}

// TODO: Client to edit these stats
const stats = [
  { value: "10+", label: "Years" },
  { value: "500+", label: "Homes Sold" },
  { value: "1,200+", label: "Clients Served" },
  { value: "98%", label: "Happy Clients" },
];

export default async function AboutPage() {
  const [agents, partners] = await Promise.all([getAgents(), getPartners()]);

  return (
    <>
      <Header />
      <main className="pt-16">
        {/* Firm story */}
        <Section>
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="aspect-[4/3] relative bg-surface border border-line">
              <Image
                src="https://picsum.photos/seed/ropeproperties-office/800/600"
                alt="RopeProperties"
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover"
              />
            </div>
            <div>
              <SectionTitle>About RopeProperties</SectionTitle>
              <p className="mt-4 text-muted leading-relaxed">
                RopeProperties is a Lagos-based real estate firm founded in 2015. We
                help clients buy, rent, and invest in premium Nigerian property — with
                honesty, local expertise, and a long-term view.
              </p>
              <p className="mt-4 text-muted leading-relaxed">
                From Lekki to Maitama, we&apos;ve guided hundreds of families and
                investors through the Nigerian property market. Our team combines deep
                market knowledge with a commitment to transparent, personalised service.
              </p>
            </div>
          </div>
        </Section>

        {/* Stats */}
        <Section background="surface">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {stats.map((stat) => (
              <div key={stat.label}>
                <p className="font-display text-4xl text-accent">{stat.value}</p>
                <p className="text-sm text-muted uppercase tracking-wide mt-2">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </Section>

        {/* Team */}
        <Section>
          <SectionTitle className="mb-10">Our Team</SectionTitle>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-10">
            {agents.map((agent) => {
              const photoUrl = getStorageUrl(agent.photo_path);
              return (
                <div key={agent.id}>
                  <div className="aspect-[3/4] relative bg-surface border border-line">
                    {photoUrl ? (
                      <Image
                        src={photoUrl}
                        alt={agent.name}
                        fill
                        sizes="(max-width: 768px) 100vw, 33vw"
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center font-display text-4xl text-muted">
                        {agent.name.charAt(0)}
                      </div>
                    )}
                  </div>
                  <h3 className="mt-4 font-display text-lg text-ink">{agent.name}</h3>
                  <p className="text-sm text-muted">{agent.role}</p>
                  {agent.bio && (
                    <p className="mt-2 text-sm text-muted leading-relaxed">{agent.bio}</p>
                  )}
                  <div className="mt-3 flex gap-3">
                    {agent.phone && (
                      <a
                        href={`tel:${agent.phone.replace(/\s/g, "")}`}
                        className="text-muted hover:text-accent transition-colors"
                      >
                        <Phone size={16} />
                      </a>
                    )}
                    {agent.email && (
                      <a
                        href={`mailto:${agent.email}`}
                        className="text-muted hover:text-accent transition-colors"
                      >
                        <Mail size={16} />
                      </a>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </Section>

        {/* Partners */}
        {partners.length > 0 && (
          <Section background="surface" id="partners">
            <SectionTitle className="mb-4">Our Partners</SectionTitle>
            <p className="text-muted mb-10 max-w-xl">
              RopeProperties also markets select properties from trusted partner firms
              across Nigeria.
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