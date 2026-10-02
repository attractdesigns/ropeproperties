import type { MetadataRoute } from "next";
import { gql } from "@/lib/nhost/gql";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://ropeproperties.com";

  const staticPages: MetadataRoute.Sitemap = [
    { url: baseUrl, lastModified: new Date(), changeFrequency: "weekly", priority: 1 },
    { url: `${baseUrl}/listings`, lastModified: new Date(), changeFrequency: "daily", priority: 0.9 },
    { url: `${baseUrl}/invest`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.8 },
    { url: `${baseUrl}/about`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.6 },
    { url: `${baseUrl}/contact`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.6 },
  ];

  const [propertiesData, opportunitiesData] = await Promise.all([
    gql<{ properties: { slug: string; updated_at: string }[] }>(`
      query SitemapProperties {
        properties(where: { status: { _neq: "draft" } }) { slug updated_at }
      }
    `),
    gql<{ investment_opportunities: { slug: string; updated_at: string }[] }>(`
      query SitemapOpportunities {
        investment_opportunities(where: { status: { _neq: "draft" } }) { slug updated_at }
      }
    `),
  ]);

  const propertyPages: MetadataRoute.Sitemap = propertiesData.properties.map((p) => ({
    url: `${baseUrl}/listings/${p.slug}`,
    lastModified: new Date(p.updated_at),
    changeFrequency: "weekly" as const,
    priority: 0.7,
  }));

  const opportunityPages: MetadataRoute.Sitemap = opportunitiesData.investment_opportunities.map((o) => ({
    url: `${baseUrl}/invest/${o.slug}`,
    lastModified: new Date(o.updated_at),
    changeFrequency: "weekly" as const,
    priority: 0.7,
  }));

  return [...staticPages, ...propertyPages, ...opportunityPages];
}
