import { cookies } from "next/headers";

const SUBDOMAIN = process.env.NEXT_PUBLIC_NHOST_SUBDOMAIN!;
const REGION = process.env.NEXT_PUBLIC_NHOST_REGION!;

export type NhostUser = {
  id: string;
  email: string;
  displayName: string;
};

export async function getAccessToken(): Promise<string | null> {
  const jar = await cookies();
  return jar.get("nhost-token")?.value ?? null;
}

/** Verify the stored token against Nhost and return the user, or null. */
export async function getAdminUser(): Promise<NhostUser | null> {
  const token = await getAccessToken();
  if (!token) return null;
  try {
    const res = await fetch(
      `https://${SUBDOMAIN}.auth.${REGION}.nhost.run/v1/user`,
      {
        headers: { Authorization: `Bearer ${token}` },
        cache: "no-store",
      }
    );
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

/** Throws a response-ready error if no valid admin session. */
export async function requireAdminUser(): Promise<NhostUser> {
  const user = await getAdminUser();
  if (!user) throw Object.assign(new Error("Unauthorized"), { status: 401 });
  return user;
}
