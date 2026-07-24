import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/lib/supabase/server";
import { getStorageUrl } from "@/lib/storage";
import { formatPriceCompactWithPeriod } from "@/lib/format";
import { StatusBadge } from "@/components/StatusBadge";
import { DeleteButton } from "@/components/admin/DeleteButton";
import type { Property, PropertyImage } from "@/lib/types";

export const dynamic = "force-dynamic";

async function getProperties() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("properties")
    .select(`
      id, title, slug, status, price, price_period, city, is_featured, updated_at,
      property_images (*)
    `)
    .order("updated_at", { ascending: false });
  return data ?? [];
}

export default async function AdminListingsPage() {
  const properties = await getProperties();

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-2xl text-ink">Listings</h1>
        <Link
          href="/admin/listings/new"
          className="bg-ink text-white px-4 py-2 text-sm font-medium hover:bg-accent transition-colors"
        >
          + New Listing
        </Link>
      </div>

      <div className="bg-white border border-line overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-line text-left">
              <th className="p-3 text-xs font-medium text-muted uppercase tracking-wide">Image</th>
              <th className="p-3 text-xs font-medium text-muted uppercase tracking-wide">Title</th>
              <th className="p-3 text-xs font-medium text-muted uppercase tracking-wide">Status</th>
              <th className="p-3 text-xs font-medium text-muted uppercase tracking-wide">Price</th>
              <th className="p-3 text-xs font-medium text-muted uppercase tracking-wide">City</th>
              <th className="p-3 text-xs font-medium text-muted uppercase tracking-wide">Featured</th>
              <th className="p-3 text-xs font-medium text-muted uppercase tracking-wide">Updated</th>
              <th className="p-3 text-xs font-medium text-muted uppercase tracking-wide">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {properties.length === 0 ? (
              <tr>
                <td colSpan={8} className="p-8 text-center text-muted">
                  No listings yet.{" "}
                  <Link href="/admin/listings/new" className="text-accent hover:text-accent-deep">
                    Create one
                  </Link>
                </td>
              </tr>
            ) : (
              properties.map((property) => {
                const p = property as unknown as Property & { property_images: PropertyImage[] };
                const coverImage = p.property_images?.[0];
                const imageUrl = getStorageUrl(coverImage?.storage_path);
                return (
                  <tr key={p.id} className="hover:bg-surface transition-colors">
                    <td className="p-3">
                      <div className="relative w-12 h-12 bg-surface border border-line">
                        {imageUrl && (
                          <Image
                            src={imageUrl}
                            alt={p.title}
                            fill
                            sizes="48px"
                            className="object-cover"
                          />
                        )}
                      </div>
                    </td>
                    <td className="p-3">
                      <Link
                        href={`/admin/listings/${p.id}/edit`}
                        className="text-sm text-ink hover:text-accent"
                      >
                        {p.title}
                      </Link>
                    </td>
                    <td className="p-3"><StatusBadge status={p.status} /></td>
                    <td className="p-3 text-sm text-ink">
                      {formatPriceCompactWithPeriod(p.price, p.price_period)}
                    </td>
                    <td className="p-3 text-sm text-muted">{p.city}</td>
                    <td className="p-3 text-sm">{p.is_featured ? "★" : ""}</td>
                    <td className="p-3 text-sm text-muted">
                      {new Date(p.updated_at).toLocaleDateString()}
                    </td>
                    <td className="p-3">
                      <div className="flex gap-2">
                        <Link
                          href={`/admin/listings/${p.id}/edit`}
                          className="text-sm text-accent hover:text-accent-deep"
                        >
                          Edit
                        </Link>
                        <DeleteButton id={p.id} type="property" title={p.title} />
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}