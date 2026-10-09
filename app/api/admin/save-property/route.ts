import { NextRequest, NextResponse } from "next/server";
import { requireAdminUser } from "@/lib/nhost/auth-server";
import { gql } from "@/lib/nhost/gql";
import { revalidatePath } from "next/cache";

export async function POST(request: NextRequest) {
  try {
    await requireAdminUser();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { images, id, ...propertyData } = body;

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
    plot_options:
      Array.isArray(propertyData.plot_options) && propertyData.plot_options.length > 0
        ? propertyData.plot_options
        : null,
    payment_terms: propertyData.payment_terms ?? null,
  };

  let propertyId: string;

  if (id) {
    const data = await gql<{ update_properties_by_pk: { id: string } | null }>(`
      mutation UpdateProperty($id: uuid!, $set: properties_set_input!) {
        update_properties_by_pk(pk_columns: { id: $id }, _set: $set) { id }
      }
    `, { id, set: record });

    if (!data.update_properties_by_pk) {
      return NextResponse.json({ error: "Property not found" }, { status: 404 });
    }
    propertyId = data.update_properties_by_pk.id;

    await gql(`
      mutation DeletePropertyImages($property_id: uuid!) {
        delete_property_images(where: { property_id: { _eq: $property_id } }) { affected_rows }
      }
    `, { property_id: propertyId });
  } else {
    const data = await gql<{ insert_properties_one: { id: string } }>(`
      mutation InsertProperty($object: properties_insert_input!) {
        insert_properties_one(object: $object) { id }
      }
    `, { object: record });
    propertyId = data.insert_properties_one.id;
  }

  if (images && images.length > 0) {
    const objects = images.map((img: { storage_path: string; alt: string | null }, i: number) => ({
      property_id: propertyId,
      storage_path: img.storage_path,
      sort_order: i,
      alt: img.alt ?? null,
    }));
    await gql(`
      mutation InsertPropertyImages($objects: [property_images_insert_input!]!) {
        insert_property_images(objects: $objects) { affected_rows }
      }
    `, { objects });
  }

  revalidatePath("/listings", "page");
  revalidatePath("/", "page");
  revalidatePath(`/listings/${record.slug}`, "page");

  return NextResponse.json({ success: true, id: propertyId });
}
