const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * Resolve a stored image reference to a public URL.
 *
 * Handles three shapes:
 *  - A full URL (http/https) → returned as-is (Unsplash seeds, external links)
 *  - A Nhost file UUID → builds the Nhost storage public URL
 *  - Anything else (old dead Supabase paths) → returns null
 */
export function getStorageUrl(path: string | null | undefined): string | null {
  if (!path) return null;
  if (path.startsWith("http://") || path.startsWith("https://")) return path;

  if (UUID_RE.test(path)) {
    const subdomain = process.env.NEXT_PUBLIC_NHOST_SUBDOMAIN;
    const region = process.env.NEXT_PUBLIC_NHOST_REGION;
    if (!subdomain || !region) return null;
    return `https://${subdomain}.storage.${region}.nhost.run/v1/files/${path}/public`;
  }

  // Old Supabase storage path — images were lost when the project was deleted.
  return null;
}
