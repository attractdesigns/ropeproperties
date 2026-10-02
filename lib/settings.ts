import { gql } from "@/lib/nhost/gql";
import { REALTOR_NAME } from "@/lib/site";
import type { SiteSettings } from "@/lib/types";

export const HERO_DEFAULTS = {
  heading: "Find a place you'll love to call home",
  subheading: `Buy and invest in Nigerian property — guided personally by ${REALTOR_NAME}.`,
  imageUrl: "https://picsum.photos/seed/ropeproperties-hero/1920/1080",
};

export async function getSiteSettings(): Promise<SiteSettings | null> {
  const data = await gql<{ site_settings: SiteSettings[] }>(`
    query SiteSettings {
      site_settings(where: { id: { _eq: 1 } }, limit: 1) {
        id updated_at hero_image_path hero_heading hero_subheading
      }
    }
  `);
  return data.site_settings[0] ?? null;
}
