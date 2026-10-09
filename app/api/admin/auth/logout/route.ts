import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createNhostClient } from "@nhost/nhost-js";

export async function POST() {
  const jar = await cookies();
  const refreshToken = jar.get("nhost-refresh")?.value;

  // Revoke the session server-side if we have the refresh token
  if (refreshToken) {
    try {
      const nhost = createNhostClient({
        subdomain: process.env.NEXT_PUBLIC_NHOST_SUBDOMAIN!,
        region: process.env.NEXT_PUBLIC_NHOST_REGION!,
      });
      await nhost.auth.signOut({ refreshToken });
    } catch {
      // Best-effort; clear cookies regardless
    }
  }

  jar.delete("nhost-token");
  jar.delete("nhost-refresh");

  return NextResponse.json({ success: true });
}
