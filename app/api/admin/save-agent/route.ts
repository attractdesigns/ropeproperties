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
  const isPrimary = body.is_primary === true;
  const id: string | undefined = body.id;

  if (!body.name) {
    return NextResponse.json({ error: "Name is required" }, { status: 400 });
  }

  // Only one agent may be the primary realtor (enforced by a unique index), so
  // stand the current one down before promoting a new one. Exclude the record
  // being saved — otherwise an edit demotes the very row it is about to promote,
  // and the primary realtor silently disappears from the site.
  if (isPrimary) {
    let demote = supabase
      .from("agents")
      .update({ is_primary: false })
      .eq("is_primary", true);

    if (id) demote = demote.neq("id", id);

    const { error: demoteError } = await demote;
    if (demoteError) {
      return NextResponse.json({ error: demoteError.message }, { status: 500 });
    }
  }

  const record = {
    name: body.name,
    role: body.role,
    phone: body.phone,
    whatsapp: body.whatsapp,
    email: body.email,
    bio: body.bio,
    photo_path: body.photo_path,
    sort_order: body.sort_order ?? 0,
    is_active: body.is_active ?? true,
    is_primary: isPrimary,
  };

  const { error } = id
    ? await supabase.from("agents").update(record).eq("id", id)
    : await supabase.from("agents").insert(record);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  revalidatePath("/about", "page");
  revalidatePath("/", "page");
  revalidatePath("/listings", "page");
  revalidatePath("/invest", "page");

  return NextResponse.json({ success: true });
}
