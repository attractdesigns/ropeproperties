-- Rentals are no longer offered.
--
-- Listings still carrying a rental status are moved to draft rather than
-- deleted, so each one can be deliberately re-priced and republished as a sale
-- or removed by hand. Note that the price on a former rental was a per-annum
-- figure, so it must be revisited before the listing goes back up.
--
-- The check constraints are then tightened so rental statuses and per-year
-- pricing cannot be entered again.

update properties
set status = 'draft'
where status in ('for_rent', 'let');

update properties
set price_period = 'total'
where price_period = 'per_year';

alter table properties drop constraint if exists properties_status_check;
alter table properties
  add constraint properties_status_check
  check (status in ('draft', 'for_sale', 'sold'));

alter table properties drop constraint if exists properties_price_period_check;
alter table properties
  add constraint properties_price_period_check
  check (price_period in ('total'));

-- The hero subheading is stored in site_settings and seeded in 00003, so the
-- code-level default in lib/settings.ts is only a fallback — the live copy has
-- to be updated here too.
update site_settings
set hero_subheading = 'Buy and invest in Nigerian property — guided personally by Opeoluwa.'
where hero_subheading = 'Buy, rent, and invest in Nigerian property — guided personally by Opeoluwa.';
