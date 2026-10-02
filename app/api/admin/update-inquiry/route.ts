import { NextRequest, NextResponse } from "next/server";
import { requireAdminUser } from "@/lib/nhost/auth-server";
import { gql } from "@/lib/nhost/gql";

export async function POST(request: NextRequest) {
  try {
    await requireAdminUser();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id, is_read } = await request.json();

  await gql(`
    mutation UpdateInquiry($id: uuid!, $is_read: Boolean!) {
      update_inquiries_by_pk(pk_columns: { id: $id }, _set: { is_read: $is_read }) { id }
    }
  `, { id, is_read });

  return NextResponse.json({ success: true });
}
