/**
 * Build the public URL for a file in the Supabase property-images storage bucket.
 * Handles both storage paths (e.g. "properties/abc.jpg") and full URLs (e.g. Unsplash).
 */
export function getStorageUrl(path: string | null | undefined): string | null {
  if (!path) return null;
  // If it's already a full URL (http/https), return as-is
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!supabaseUrl) return null;
  return `${supabaseUrl}/storage/v1/object/public/property-images/${path}`;
}