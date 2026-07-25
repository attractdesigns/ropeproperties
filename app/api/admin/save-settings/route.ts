import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();

  // The settings row is created by the migration, but upsert so a missing row
  // repairs itself rather than silently saving nothing.
  const { error } = await supabase.from("site_settings").upsert({
    id: 1,
    hero_image_path: body.hero_image_path ?? null,
    hero_heading: body.hero_heading ?? null,
    hero_subheading: body.hero_subheading ?? null,
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  revalidatePath("/", "page");

  return NextResponse.json({ success: true });
}
