-- RopeProperties — Realtor identity
--
-- Repositions the site from "real estate firm" to "Opeoluwa, realtor":
--   1. One agent is the primary realtor (Opeoluwa) — the public face used on
--      every listing that has no specific agent assigned. Everyone else is
--      support staff, shown more quietly on the About page.
--   2. Client testimonials, the main trust signal for an individual realtor.

-- ─────────────────────────────────────────────────────────────────────────────
-- 1. Primary realtor
-- ─────────────────────────────────────────────────────────────────────────────

alter table agents
  add column if not exists is_primary boolean not null default false;

-- At most one primary realtor. Partial index so the many `false` rows are
-- unconstrained while `true` can only ever appear once.
create unique index if not exists agents_single_primary
  on agents (is_primary) where is_primary;

-- ─────────────────────────────────────────────────────────────────────────────
-- 2. Testimonials
-- ─────────────────────────────────────────────────────────────────────────────

create table if not exists testimonials (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  client_name text not null,
  location text,                      -- e.g. 'Lekki Phase 1, Lagos'
  quote text not null,
  sort_order int not null default 0,
  is_active boolean not null default true
);

alter table testimonials enable row level security;

create policy "Public can view active testimonials"
  on testimonials for select to anon
  using (is_active = true);

create policy "Authenticated can manage testimonials"
  on testimonials for all to authenticated
  using (true) with check (true);
