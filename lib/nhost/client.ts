import { createClient as createNhostClient } from "@nhost/nhost-js";

/**
 * Public Nhost client — safe to use in server components and the browser.
 * Uses the project's public GraphQL endpoint with whatever session the
 * request carries. For admin-only queries that bypass permissions, use
 * `createAdminClient()` from ./admin.
 */
export function createClient() {
  const subdomain = process.env.NEXT_PUBLIC_NHOST_SUBDOMAIN;
  const region = process.env.NEXT_PUBLIC_NHOST_REGION;

  if (!subdomain || !region) {
    throw new Error(
      "Missing NEXT_PUBLIC_NHOST_SUBDOMAIN or NEXT_PUBLIC_NHOST_REGION. " +
        "Add them to .env.local (see .env.example)."
    );
  }

  return createNhostClient({ subdomain, region });
}

/**
 * Builds the public URL for a stored file. Replaces Supabase's
 * `getStorageUrl(path)` — Nhost identifies files by UUID, not path.
 */
export function getFileUrl(fileId: string | null | undefined): string | null {
  if (!fileId) return null;
  const subdomain = process.env.NEXT_PUBLIC_NHOST_SUBDOMAIN;
  const region = process.env.NEXT_PUBLIC_NHOST_REGION;
  if (!subdomain || !region) return null;
  return `https://${subdomain}.storage.${region}.nhost.run/v1/files/${fileId}/public`;
}
