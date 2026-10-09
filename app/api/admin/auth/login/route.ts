import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createNhostClient } from "@nhost/nhost-js";

export async function POST(request: Request) {
  const { email, password } = await request.json();

  if (!email || !password) {
    return NextResponse.json({ error: "Email and password are required" }, { status: 400 });
  }

  const nhost = createNhostClient({
    subdomain: process.env.NEXT_PUBLIC_NHOST_SUBDOMAIN!,
    region: process.env.NEXT_PUBLIC_NHOST_REGION!,
  });

  const res = await nhost.auth.signInEmailPassword({ email, password });
  const session = res.body?.session;

  if (!session) {
    return NextResponse.json(
      { error: "Invalid email or password" },
      { status: 401 }
    );
  }

  const secure = process.env.NODE_ENV === "production";
  const jar = await cookies();

  jar.set("nhost-token", session.accessToken, {
    httpOnly: true,
    secure,
    sameSite: "lax",
    maxAge: session.accessTokenExpiresIn,
    path: "/",
  });

  jar.set("nhost-refresh", session.refreshToken, {
    httpOnly: true,
    secure,
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 30,
    path: "/",
  });

  return NextResponse.json({ success: true });
}
