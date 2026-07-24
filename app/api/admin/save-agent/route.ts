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

  const { error } = await supabase.from("agents").insert({
    name: body.name,
    role: body.role,
    phone: body.phone,
    whatsapp: body.whatsapp,
    email: body.email,
    bio: body.bio,
    photo_path: body.photo_path,
    sort_order: body.sort_order ?? 0,
    is_active: body.is_active ?? true,
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  revalidatePath("/about", "page");

  return NextResponse.json({ success: true });
}