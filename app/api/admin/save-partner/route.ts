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

  const { error } = await supabase.from("partner_companies").insert({
    name: body.name,
    website_url: body.website_url,
    description: body.description,
    logo_path: body.logo_path,
    sort_order: body.sort_order ?? 0,
    is_active: body.is_active ?? true,
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  revalidatePath("/about", "page");
  revalidatePath("/", "page");

  return NextResponse.json({ success: true });
}