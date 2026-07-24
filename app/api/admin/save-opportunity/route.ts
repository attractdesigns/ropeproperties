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
  const { images, id, ...oppData } = body;

  const record = {
    title: oppData.title,
    slug: oppData.slug,
    description: oppData.description,
    status: oppData.status,
    investment_type: oppData.investment_type,
    city: oppData.city,
    neighbourhood: oppData.neighbourhood,
    roi_range: oppData.roi_range,
    min_entry: oppData.min_entry,
    duration: oppData.duration,
    map_embed_url: oppData.map_embed_url,
    is_featured: oppData.is_featured,
    agent_id: oppData.agent_id || null,
  };

  let opportunityId: string;

  if (id) {
    const { data, error } = await supabase
      .from("investment_opportunities")
      .update(record)
      .eq("id", id)
      .select("id")
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    opportunityId = data.id;

    await supabase.from("investment_images").delete().eq("opportunity_id", opportunityId);
  } else {
    const { data, error } = await supabase
      .from("investment_opportunities")
      .insert(record)
      .select("id")
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    opportunityId = data.id;
  }

  if (images && images.length > 0) {
    const imageRecords = images.map((img: { storage_path: string; sort_order: number; alt: string | null }, index: number) => ({
      opportunity_id: opportunityId,
      storage_path: img.storage_path,
      sort_order: index,
      alt: img.alt,
    }));
    const { error: imgError } = await supabase.from("investment_images").insert(imageRecords);
    if (imgError) console.error("Image insert error:", imgError);
  }

  revalidatePath("/invest", "page");
  revalidatePath("/", "page");
  revalidatePath(`/invest/${record.slug}`, "page");

  return NextResponse.json({ success: true, id: opportunityId });
}