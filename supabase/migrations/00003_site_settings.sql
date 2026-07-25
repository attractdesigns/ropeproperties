-- RopeProperties — Site settings
--
-- Homepage hero content (image, headline, subheading) so it can be changed from
-- the admin instead of requiring a code change and a deploy.
--
-- Deliberately a single row: `id` is fixed at 1 by the check constraint, and the
-- row is inserted here, so the app can always read/update it without worrying
-- about creating it first.

create table if not exists site_settings (
  id int primary key default 1 check (id = 1),
  updated_at timestamptz not null default now(),
  hero_image_path text,               -- storage path in property-images, or a full URL
  hero_heading text,
  hero_subheading text
);

-- Seed with the copy that is currently hardcoded on the homepage, so the admin
-- form shows the live text rather than empty boxes.
insert into site_settings (id, hero_heading, hero_subheading)
values (
  1,
  'Find a place you''ll love to call home',
  'Buy, rent, and invest in Nigerian property — guided personally by Opeoluwa.'
)
on conflict (id) do nothing;

-- Postgres has no `create trigger if not exists`, so drop first to keep this
-- migration safe to re-run.
drop trigger if exists site_settings_updated_at on site_settings;
create trigger site_settings_updated_at before update on site_settings
  for each row execute function update_updated_at();

alter table site_settings enable row level security;

drop policy if exists "Public can view site settings" on site_settings;
create policy "Public can view site settings"
  on site_settings for select to anon
  using (true);

drop policy if exists "Authenticated can manage site settings" on site_settings;
create policy "Authenticated can manage site settings"
  on site_settings for all to authenticated
  using (true) with check (true);
