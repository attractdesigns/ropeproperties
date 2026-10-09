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

  await gql(`
    mutation UpsertSiteSettings($object: site_settings_insert_input!) {
      insert_site_settings_one(
        object: $object
        on_conflict: {
          constraint: site_settings_pkey
          update_columns: [hero_image_path, hero_heading, hero_subheading, updated_at]
        }
      ) { id }
    }
  `, {
    object: {
      id: 1,
      hero_image_path: body.hero_image_path ?? null,
      hero_heading: body.hero_heading ?? null,
      hero_subheading: body.hero_subheading ?? null,
      updated_at: new Date().toISOString(),
    },
  });

  revalidatePath("/", "page");

  return NextResponse.json({ success: true });
}
