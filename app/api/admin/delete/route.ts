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

  const { id, type } = await request.json();

  switch (type) {
    case "property":
      await gql(`
        mutation DeleteProperty($id: uuid!) {
          delete_properties_by_pk(id: $id) { id }
        }
      `, { id });
      revalidatePath("/listings", "page");
      revalidatePath("/", "page");
      break;

    case "opportunity":
      await gql(`
        mutation DeleteOpportunity($id: uuid!) {
          delete_investment_opportunities_by_pk(id: $id) { id }
        }
      `, { id });
      revalidatePath("/invest", "page");
      revalidatePath("/", "page");
      break;

    case "agent":
      await gql(`
        mutation DeleteAgent($id: uuid!) {
          delete_agents_by_pk(id: $id) { id }
        }
      `, { id });
      revalidatePath("/about", "page");
      break;

    case "partner":
      await gql(`
        mutation DeletePartner($id: uuid!) {
          delete_partner_companies_by_pk(id: $id) { id }
        }
      `, { id });
      revalidatePath("/about", "page");
      revalidatePath("/", "page");
      break;

    case "inquiry":
      await gql(`
        mutation DeleteInquiry($id: uuid!) {
          delete_inquiries_by_pk(id: $id) { id }
        }
      `, { id });
      break;

    case "testimonial":
      await gql(`
        mutation DeleteTestimonial($id: uuid!) {
          delete_testimonials_by_pk(id: $id) { id }
        }
      `, { id });
      revalidatePath("/about", "page");
      revalidatePath("/", "page");
      break;

    default:
      return NextResponse.json({ error: "Invalid type" }, { status: 400 });
  }

  return NextResponse.json({ success: true });
}
