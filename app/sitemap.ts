import type { MetadataRoute } from "next";
import { createClient } from "@/lib/supabase/server";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = await createClient();

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://ropeproperties.com";

  const staticPages: MetadataRoute.Sitemap = [
    { url: baseUrl, lastModified: new Date(), changeFrequency: "weekly", priority: 1 },
    { url: `${baseUrl}/listings`, lastModified: new Date(), changeFrequency: "daily", priority: 0.9 },
    { url: `${baseUrl}/invest`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.8 },
    { url: `${baseUrl}/about`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.6 },
    { url: `${baseUrl}/contact`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.6 },
  ];

  // Property pages
  const { data: properties } = await supabase
    .from("properties")
    .select("slug, updated_at")
    .neq("status", "draft");

  const propertyPages: MetadataRoute.Sitemap = (properties ?? []).map((p) => ({
    url: `${baseUrl}/listings/${p.slug}`,
    lastModified: new Date(p.updated_at),
    changeFrequency: "weekly" as const,
    priority: 0.7,
  }));

  // Investment pages
  const { data: opportunities } = await supabase
    .from("investment_opportunities")
    .select("slug, updated_at")
    .neq("status", "draft");

  const opportunityPages: MetadataRoute.Sitemap = (opportunities ?? []).map((o) => ({
    url: `${baseUrl}/invest/${o.slug}`,
    lastModified: new Date(o.updated_at),
    changeFrequency: "weekly" as const,
    priority: 0.7,
  }));

  return [...staticPages, ...propertyPages, ...opportunityPages];
}