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
    advertised_returns:
      Array.isArray(oppData.advertised_returns) && oppData.advertised_returns.length > 0
        ? oppData.advertised_returns
        : null,
  };

  let opportunityId: string;

  if (id) {
    const data = await gql<{ update_investment_opportunities_by_pk: { id: string } | null }>(`
      mutation UpdateOpportunity($id: uuid!, $set: investment_opportunities_set_input!) {
        update_investment_opportunities_by_pk(pk_columns: { id: $id }, _set: $set) { id }
      }
    `, { id, set: record });

    if (!data.update_investment_opportunities_by_pk) {
      return NextResponse.json({ error: "Opportunity not found" }, { status: 404 });
    }
    opportunityId = data.update_investment_opportunities_by_pk.id;

    await gql(`
      mutation DeleteInvestmentImages($opportunity_id: uuid!) {
        delete_investment_images(where: { opportunity_id: { _eq: $opportunity_id } }) { affected_rows }
      }
    `, { opportunity_id: opportunityId });
  } else {
    const data = await gql<{ insert_investment_opportunities_one: { id: string } }>(`
      mutation InsertOpportunity($object: investment_opportunities_insert_input!) {
        insert_investment_opportunities_one(object: $object) { id }
      }
    `, { object: record });
    opportunityId = data.insert_investment_opportunities_one.id;
  }

  if (images && images.length > 0) {
    const objects = images.map((img: { storage_path: string; alt: string | null }, i: number) => ({
      opportunity_id: opportunityId,
      storage_path: img.storage_path,
      sort_order: i,
      alt: img.alt ?? null,
    }));
    await gql(`
      mutation InsertInvestmentImages($objects: [investment_images_insert_input!]!) {
        insert_investment_images(objects: $objects) { affected_rows }
      }
    `, { objects });
  }

  revalidatePath("/invest", "page");
  revalidatePath("/", "page");
  revalidatePath(`/invest/${record.slug}`, "page");

  return NextResponse.json({ success: true, id: opportunityId });
}
