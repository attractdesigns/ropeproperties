import { createClient } from "@/lib/supabase/server";
import type { Agent, Testimonial } from "@/lib/types";

/**
 * The realtor the site is built around (Opeoluwa).
 *
 * Listings may be assigned to a specific agent, but most are not — this is a
 * one-realtor practice with support staff, so anything unassigned should still
 * show a human contact rather than nothing.
 */
export async function getPrimaryRealtor(): Promise<Agent | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("agents")
    .select("*")
    .eq("is_primary", true)
    .eq("is_active", true)
    .maybeSingle();
  return data ?? null;
}

/** Support staff — everyone active who is not the primary realtor. */
export async function getSupportStaff(): Promise<Agent[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("agents")
    .select("*")
    .eq("is_active", true)
    .eq("is_primary", false)
    .order("sort_order", { ascending: true });
  return data ?? [];
}

export async function getTestimonials(): Promise<Testimonial[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("testimonials")
    .select("*")
    .eq("is_active", true)
    .order("sort_order", { ascending: true });
  return data ?? [];
}
