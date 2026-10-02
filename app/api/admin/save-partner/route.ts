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
  const id: string | undefined = body.id;

  if (!body.name) {
    return NextResponse.json({ error: "Name is required" }, { status: 400 });
  }

  const record = {
    name: body.name,
    website_url: body.website_url,
    description: body.description,
    logo_path: body.logo_path,
    sort_order: body.sort_order ?? 0,
    is_active: body.is_active ?? true,
  };

  if (id) {
    await gql(`
      mutation UpdatePartner($id: uuid!, $set: partner_companies_set_input!) {
        update_partner_companies_by_pk(pk_columns: { id: $id }, _set: $set) { id }
      }
    `, { id, set: record });
  } else {
    await gql(`
      mutation InsertPartner($object: partner_companies_insert_input!) {
        insert_partner_companies_one(object: $object) { id }
      }
    `, { object: record });
  }

  revalidatePath("/about", "page");
  revalidatePath("/", "page");

  return NextResponse.json({ success: true });
}
