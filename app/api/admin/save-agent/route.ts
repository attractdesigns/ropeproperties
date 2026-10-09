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
  const isPrimary = body.is_primary === true;
  const id: string | undefined = body.id;

  if (!body.name) {
    return NextResponse.json({ error: "Name is required" }, { status: 400 });
  }

  if (isPrimary) {
    // Demote any existing primary agents (exclude the record being saved).
    const where: Record<string, unknown> = { is_primary: { _eq: true } };
    if (id) where.id = { _neq: id };

    await gql(`
      mutation DemoteOtherPrimaries($where: agents_bool_exp!) {
        update_agents(where: $where, _set: { is_primary: false }) { affected_rows }
      }
    `, { where });
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

  if (id) {
    await gql(`
      mutation UpdateAgent($id: uuid!, $set: agents_set_input!) {
        update_agents_by_pk(pk_columns: { id: $id }, _set: $set) { id }
      }
    `, { id, set: record });
  } else {
    await gql(`
      mutation InsertAgent($object: agents_insert_input!) {
        insert_agents_one(object: $object) { id }
      }
    `, { object: record });
  }

  revalidatePath("/about", "page");
  revalidatePath("/", "page");
  revalidatePath("/listings", "page");
  revalidatePath("/invest", "page");

  return NextResponse.json({ success: true });
}
