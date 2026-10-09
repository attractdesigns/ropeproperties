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

  if (!body.client_name || !body.quote) {
    return NextResponse.json({ error: "Client name and quote are required" }, { status: 400 });
  }

  await gql(`
    mutation InsertTestimonial($object: testimonials_insert_input!) {
      insert_testimonials_one(object: $object) { id }
    }
  `, {
    object: {
      client_name: String(body.client_name),
      location: body.location ?? null,
      quote: String(body.quote),
      sort_order: body.sort_order ?? 0,
      is_active: body.is_active ?? true,
    },
  });

  revalidatePath("/about", "page");
  revalidatePath("/", "page");

  return NextResponse.json({ success: true });
}
