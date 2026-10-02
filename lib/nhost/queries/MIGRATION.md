# Nhost Migration Map

Each row maps a Supabase query to its Nhost GraphQL equivalent.
Once NEXT_PUBLIC_NHOST_SUBDOMAIN, NEXT_PUBLIC_NHOST_REGION and
NHOST_ADMIN_SECRET are in .env.local, swap each file.

## Status legend
- ✅ Done — file exists in lib/nhost/queries/
- 🔲 Todo — Supabase call still used

---

## Public reads (server components)

| File | Supabase table | Status |
|------|---------------|--------|
| lib/nhost/queries/properties.ts | properties + property_images + agents + partner_companies | ✅ |
| lib/nhost/queries/listings.ts | same as above, all + filters + sort | 🔲 |
| lib/nhost/queries/listing.ts | single property by slug | 🔲 |
| lib/nhost/queries/investments.ts | investment_opportunities + investment_images + agents | 🔲 |
| lib/nhost/queries/investment.ts | single investment by slug | 🔲 |
| lib/nhost/queries/cities.ts | distinct cities from properties | 🔲 |
| lib/nhost/queries/realtor.ts | agents where is_primary=true + testimonials | 🔲 |
| lib/nhost/queries/settings.ts | site_settings row | 🔲 |
| lib/nhost/queries/partners.ts | partner_companies where is_active=true | 🔲 |
| lib/nhost/queries/testimonials.ts | testimonials | 🔲 |

## Admin reads (dashboard pages — needs adminSecret)

| File | Supabase table | Status |
|------|---------------|--------|
| lib/nhost/queries/admin/listings.ts | all properties including draft | 🔲 |
| lib/nhost/queries/admin/investments.ts | all investment_opportunities | 🔲 |
| lib/nhost/queries/admin/agents.ts | all agents | 🔲 |
| lib/nhost/queries/admin/partners.ts | all partner_companies | 🔲 |
| lib/nhost/queries/admin/testimonials.ts | all testimonials | 🔲 |
| lib/nhost/queries/admin/inquiries.ts | all inquiry_submissions | 🔲 |
| lib/nhost/queries/admin/settings.ts | site_settings | 🔲 |

## Admin writes (API routes)

| Route | Action | Status |
|-------|--------|--------|
| app/api/admin/save-property | upsert properties row | 🔲 |
| app/api/admin/save-opportunity | upsert investment_opportunities row | 🔲 |
| app/api/admin/save-agent | upsert agents row | 🔲 |
| app/api/admin/save-partner | upsert partner_companies row | 🔲 |
| app/api/admin/save-testimonial | upsert testimonials row | 🔲 |
| app/api/admin/save-settings | upsert site_settings row | 🔲 |
| app/api/admin/update-inquiry | update inquiry_submissions row | 🔲 |
| app/api/admin/delete | delete from any table by id | 🔲 |
| app/api/inquiries | insert inquiry_submissions row | 🔲 |

## Storage (lib/storage.ts → lib/nhost/storage.ts)

Old: `getStorageUrl(storage_path: string)` — builds Supabase public URL from a path string.
New: `getFileUrl(fileId: string)` — already in lib/nhost/client.ts.

Key change: Supabase stored a **path** (e.g. `property-images/abc.jpg`).
Nhost storage identifies files by **UUID** (e.g. `3f2504e0-4f89-11d3-9a0c-0305e82c3301`).

After restoring the .backup to Nhost Postgres, the storage_path columns will
still hold Supabase paths. Two options:
1. Add a `nhost_file_id` column to each image table during migration.
2. Re-upload all images (they were lost with the Supabase project anyway) and
   store the returned file IDs in the storage_path column.

Option 2 is simpler since images are already lost.

## Auth (lib/supabase/middleware.ts → middleware.ts)

Nhost's v4 SDK is isomorphic — no special SSR helper needed for reading sessions.
For admin login:
- Replace `supabase.auth.signInWithPassword` with `nhost.auth.signInEmailPassword`
- Store the returned accessToken in an httpOnly cookie (middleware reads it)
- Admin middleware reads the cookie, calls `nhost.auth.getUser()` to verify

Files to change:
- middleware.ts
- lib/supabase/middleware.ts (remove entirely)
- app/admin/login/page.tsx
- app/admin/layout.tsx

---

## How to run the full migration

1. Create Nhost project at nhost.io
2. Restore the .backup file: `pg_restore -d <connection_string> db_cluster-30-08-2026@10-07-45.backup`
3. In Hasura console → Data → click "Track all" to expose all tables
4. Add Hasura permissions: allow select on public tables for "public" role
5. Fill in .env.local: NEXT_PUBLIC_NHOST_SUBDOMAIN, NEXT_PUBLIC_NHOST_REGION, NHOST_ADMIN_SECRET
6. Verify lib/nhost/queries/properties.ts works by starting dev server
7. Complete the 🔲 items above in order (public reads first, then admin reads, then writes, then auth, then storage)
