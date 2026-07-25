import { createClient } from "@/lib/supabase/server";
import { REALTOR_NAME } from "@/lib/site";
import type { SiteSettings } from "@/lib/types";

/**
 * Homepage hero content, editable from Admin → Site settings.
 *
 * Every field is optional in the database — the defaults below are what the site
 * shows until someone sets them, so an empty table (or an unrun migration) can
 * never leave the homepage blank.
 */
export const HERO_DEFAULTS = {
  heading: "Find a place you'll love to call home",
  subheading: `Buy, rent, and invest in Nigerian property — guided personally by ${REALTOR_NAME}.`,
  /** Placeholder until a real property photo is uploaded. */
  imageUrl: "https://picsum.photos/seed/ropeproperties-hero/1920/1080",
};

export async function getSiteSettings(): Promise<SiteSettings | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("site_settings")
    .select("*")
    .eq("id", 1)
    .maybeSingle();
  return data ?? null;
}
