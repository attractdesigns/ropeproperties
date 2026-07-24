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
  const { images, id, ...propertyData } = body;

  // Prepare property record
  const record = {
    title: propertyData.title,
    slug: propertyData.slug,
    description: propertyData.description,
    status: propertyData.status,
    property_type: propertyData.property_type,
    price: propertyData.price,
    price_period: propertyData.price_period,
    bedrooms: propertyData.bedrooms,
    bathrooms: propertyData.bathrooms,
    toilets: propertyData.toilets,
    parking: propertyData.parking,
    size_sqm: propertyData.size_sqm,
    city: propertyData.city,
    neighbourhood: propertyData.neighbourhood,
    address: propertyData.address,
    features: propertyData.features,
    map_embed_url: propertyData.map_embed_url,
    is_featured: propertyData.is_featured,
    is_investment: propertyData.is_investment,
    investment_note: propertyData.investment_note,
    partner_id: propertyData.partner_id || null,
    agent_id: propertyData.agent_id || null,
  };

  let propertyId: string;

  if (id) {
    // Update
    const { data, error } = await supabase
      .from("properties")
      .update(record)
      .eq("id", id)
      .select("id")
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    propertyId = data.id;

    // Delete existing images and re-insert
    await supabase.from("property_images").delete().eq("property_id", propertyId);
  } else {
    // Insert
    const { data, error } = await supabase
      .from("properties")
      .insert(record)
      .select("id")
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    propertyId = data.id;
  }

  // Insert images
  if (images && images.length > 0) {
    const imageRecords = images.map((img: { storage_path: string; sort_order: number; alt: string | null }, index: number) => ({
      property_id: propertyId,
      storage_path: img.storage_path,
      sort_order: index,
      alt: img.alt,
    }));
    const { error: imgError } = await supabase.from("property_images").insert(imageRecords);
    if (imgError) {
      console.error("Image insert error:", imgError);
    }
  }

  revalidatePath("/listings", "page");
  revalidatePath("/", "page");
  revalidatePath(`/listings/${record.slug}`, "page");

  return NextResponse.json({ success: true, id: propertyId });
}