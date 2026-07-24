-- RopeProperties — Initial migration
-- Creates all tables, RLS policies, and storage bucket policies

-- Extensions
create extension if not exists "pgcrypto";

-- ─────────────────────────────────────────────────────────────────────────────
-- Tables (order matters for FK references)
-- ─────────────────────────────────────────────────────────────────────────────

-- partner_companies (referenced by properties)
create table if not exists partner_companies (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  logo_path text,
  website_url text,
  description text,
  sort_order int not null default 0,
  is_active boolean not null default true
);

-- agents (referenced by properties and investment_opportunities)
create table if not exists agents (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  role text not null default 'Agent',
  phone text,
  whatsapp text,
  email text,
  photo_path text,
  bio text,
  sort_order int not null default 0,
  is_active boolean not null default true
);

-- properties
create table if not exists properties (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  title text not null,
  slug text not null unique,
  description text not null default '',
  status text not null default 'draft'
    check (status in ('draft','for_sale','for_rent','sold','let')),
  property_type text not null
    check (property_type in ('apartment','house','duplex','terrace','bungalow','land','commercial')),
  price numeric not null default 0,
  price_period text not null default 'total'
    check (price_period in ('total','per_year')),
  bedrooms int, bathrooms int, toilets int, parking int,
  size_sqm numeric,
  city text not null,
  neighbourhood text,
  address text,
  features text[] not null default '{}',
  map_embed_url text,
  is_featured boolean not null default false,
  is_investment boolean not null default false,
  investment_note text,
  partner_id uuid references partner_companies(id) on delete set null,
  agent_id uuid references agents(id) on delete set null
);

-- property_images
create table if not exists property_images (
  id uuid primary key default gen_random_uuid(),
  property_id uuid not null references properties(id) on delete cascade,
  storage_path text not null,
  sort_order int not null default 0,
  alt text
);

-- investment_opportunities
create table if not exists investment_opportunities (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  title text not null,
  slug text not null unique,
  description text not null default '',
  status text not null default 'draft'
    check (status in ('draft','open','closing_soon','closed')),
  investment_type text not null
    check (investment_type in ('off_plan','land_banking','buy_to_let','development','flip')),
  city text not null,
  neighbourhood text,
  roi_range text,
  min_entry numeric,
  duration text,
  map_embed_url text,
  is_featured boolean not null default false,
  agent_id uuid references agents(id) on delete set null
);

-- investment_images
create table if not exists investment_images (
  id uuid primary key default gen_random_uuid(),
  opportunity_id uuid not null references investment_opportunities(id) on delete cascade,
  storage_path text not null,
  sort_order int not null default 0,
  alt text
);

-- inquiries
create table if not exists inquiries (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  kind text not null check (kind in ('contact','viewing','investment')),
  property_id uuid references properties(id) on delete set null,
  opportunity_id uuid references investment_opportunities(id) on delete set null,
  name text not null,
  phone text not null,
  email text,
  message text,
  preferred_date date,
  is_read boolean not null default false
);

-- ─────────────────────────────────────────────────────────────────────────────
-- Updated_at trigger
-- ─────────────────────────────────────────────────────────────────────────────

create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger properties_updated_at before update on properties
  for each row execute function update_updated_at();

create trigger investment_opportunities_updated_at before update on investment_opportunities
  for each row execute function update_updated_at();

-- ─────────────────────────────────────────────────────────────────────────────
-- Row Level Security
-- ─────────────────────────────────────────────────────────────────────────────

alter table properties enable row level security;
alter table property_images enable row level security;
alter table investment_opportunities enable row level security;
alter table investment_images enable row level security;
alter table agents enable row level security;
alter table partner_companies enable row level security;
alter table inquiries enable row level security;

-- Properties: anon select non-draft, authenticated full CRUD
create policy "Public can view published properties"
  on properties for select to anon
  using (status <> 'draft');

create policy "Authenticated can manage properties"
  on properties for all to authenticated
  using (true) with check (true);

-- Property images: anon select (join through published property), authenticated full
create policy "Public can view images of published properties"
  on property_images for select to anon
  using (
    exists (
      select 1 from properties
      where properties.id = property_images.property_id
      and properties.status <> 'draft'
    )
  );

create policy "Authenticated can manage property images"
  on property_images for all to authenticated
  using (true) with check (true);

-- Investment opportunities: anon select non-draft, authenticated full
create policy "Public can view published opportunities"
  on investment_opportunities for select to anon
  using (status <> 'draft');

create policy "Authenticated can manage opportunities"
  on investment_opportunities for all to authenticated
  using (true) with check (true);

-- Investment images: same pattern
create policy "Public can view images of published opportunities"
  on investment_images for select to anon
  using (
    exists (
      select 1 from investment_opportunities
      where investment_opportunities.id = investment_images.opportunity_id
      and investment_opportunities.status <> 'draft'
    )
  );

create policy "Authenticated can manage investment images"
  on investment_images for all to authenticated
  using (true) with check (true);

-- Agents: anon select active, authenticated full
create policy "Public can view active agents"
  on agents for select to anon
  using (is_active = true);

create policy "Authenticated can manage agents"
  on agents for all to authenticated
  using (true) with check (true);

-- Partner companies: anon select active, authenticated full
create policy "Public can view active partners"
  on partner_companies for select to anon
  using (is_active = true);

create policy "Authenticated can manage partners"
  on partner_companies for all to authenticated
  using (true) with check (true);

-- Inquiries: anon insert only, authenticated select/update/delete
create policy "Public can create inquiries"
  on inquiries for insert to anon
  with check (true);

create policy "Authenticated can manage inquiries"
  on inquiries for all to authenticated
  using (true) with check (true);

-- ─────────────────────────────────────────────────────────────────────────────
-- Storage bucket policies
-- ─────────────────────────────────────────────────────────────────────────────

-- Create the property-images bucket if it doesn't exist
insert into storage.buckets (id, name, public)
values ('property-images', 'property-images', true)
on conflict (id) do nothing;

-- Public read
create policy "Public can read property images"
  on storage.objects for select to anon
  using (bucket_id = 'property-images');

-- Authenticated write
create policy "Authenticated can write property images"
  on storage.objects for insert to authenticated
  with check (bucket_id = 'property-images');

create policy "Authenticated can update property images"
  on storage.objects for update to authenticated
  using (bucket_id = 'property-images');

create policy "Authenticated can delete property images"
  on storage.objects for delete to authenticated
  using (bucket_id = 'property-images');