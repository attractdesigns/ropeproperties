import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id, type } = await request.json();

  let error: { message: string } | null = null;

  if (type === "property") {
    ({ error } = await supabase.from("properties").delete().eq("id", id));
    revalidatePath("/listings", "page");
    revalidatePath("/", "page");
  } else if (type === "opportunity") {
    ({ error } = await supabase.from("investment_opportunities").delete().eq("id", id));
    revalidatePath("/invest", "page");
    revalidatePath("/", "page");
  } else if (type === "agent") {
    ({ error } = await supabase.from("agents").delete().eq("id", id));
    revalidatePath("/about", "page");
  } else if (type === "partner") {
    ({ error } = await supabase.from("partner_companies").delete().eq("id", id));
    revalidatePath("/about", "page");
    revalidatePath("/", "page");
  } else if (type === "inquiry") {
    ({ error } = await supabase.from("inquiries").delete().eq("id", id));
  } else {
    return NextResponse.json({ error: "Invalid type" }, { status: 400 });
  }

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}