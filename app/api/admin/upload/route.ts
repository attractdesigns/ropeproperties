import { NextRequest, NextResponse } from "next/server";
import { requireAdminUser } from "@/lib/nhost/auth-server";
import { createAdminClient } from "@/lib/nhost/admin";

/**
 * Admin-only file upload. Accepts multipart/form-data with a single "file"
 * field and stores it in Nhost Storage via the admin client, bypassing
 * permissions (the browser never sees the admin secret). Returns the
 * resulting file UUID, which callers store as the "photo_path" /
 * image-reference column — resolved back to a URL via getStorageUrl().
 */
export async function POST(request: NextRequest) {
  try {
    await requireAdminUser();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const formData = await request.formData();
  const file = formData.get("file");

  if (!(file instanceof Blob)) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }

  const nhost = createAdminClient();

  const res = await nhost.storage.uploadFiles({
    "file[]": [file],
  });

  const uploaded = res.body?.processedFiles?.[0];

  if (!uploaded?.id) {
    return NextResponse.json({ error: "Upload failed" }, { status: 502 });
  }

  return NextResponse.json({ id: uploaded.id });
}
