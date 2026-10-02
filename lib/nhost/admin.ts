import { createNhostClient, withAdminSession } from "@nhost/nhost-js";

/**
 * Admin Nhost client — uses the Hasura admin secret, bypassing all permissions.
 * Server-only. Use for admin dashboard writes and reads that RLS would block.
 *
 * NEVER import this from a client component or expose the secret.
 */
export function createAdminClient() {
  const subdomain = process.env.NEXT_PUBLIC_NHOST_SUBDOMAIN;
  const region = process.env.NEXT_PUBLIC_NHOST_REGION;
  const adminSecret = process.env.NHOST_ADMIN_SECRET;

  if (!subdomain || !region || !adminSecret) {
    throw new Error(
      "Missing Nhost env vars. Need NEXT_PUBLIC_NHOST_SUBDOMAIN, " +
        "NEXT_PUBLIC_NHOST_REGION, and NHOST_ADMIN_SECRET."
    );
  }

  return createNhostClient({
    subdomain,
    region,
    configure: [withAdminSession({ adminSecret })],
  });
}
