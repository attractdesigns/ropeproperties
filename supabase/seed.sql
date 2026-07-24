-- RopeProperties — Seed data
-- Run after 00001_initial.sql
-- Uses Unsplash URLs as placeholder images (stored in property_images.storage_path
-- as full URLs — the app handles both storage paths and full URLs)

-- ─────────────────────────────────────────────────────────────────────────────
-- Agents
-- ─────────────────────────────────────────────────────────────────────────────

insert into agents (id, name, role, phone, whatsapp, email, bio, sort_order, is_active) values
  ('a0000001-0000-0000-0000-000000000001', 'Chidi Okafor', 'Senior Agent', '+234 803 123 4567', '2348031234567', 'chidi@ropeproperties.com', 'Chidi has over a decade of experience in Lagos luxury real estate, specialising in Lekki and Ikoyi.', 1, true),
  ('a0000002-0000-0000-0000-000000000002', 'Aisha Bello', 'Investment Lead', '+234 805 234 5678', '2348052345678', 'aisha@ropeproperties.com', 'Aisha leads our investment advisory practice, helping clients identify high-yield opportunities.', 2, true),
  ('a0000003-0000-0000-0000-000000000003', 'Tunde Adeyemi', 'Agent', '+234 807 345 6789', '2348073456789', 'tunde@ropeproperties.com', 'Tunde covers Abuja — Maitama, Gwarinpa, and surrounding areas.', 3, true);

-- ─────────────────────────────────────────────────────────────────────────────
-- Partner Companies
-- ─────────────────────────────────────────────────────────────────────────────

insert into partner_companies (id, name, website_url, description, sort_order, is_active) values
  ('b0000001-0000-0000-0000-000000000001', 'Pinnacle Realty', 'https://example.com/pinnacle', 'Luxury homes across Lagos and Abuja.', 1, true),
  ('b0000002-0000-0000-0000-000000000002', 'Eko Estates', 'https://example.com/ekoestates', 'Premium developments in Victoria Island and Ikoyi.', 2, true);

-- ─────────────────────────────────────────────────────────────────────────────
-- Properties
-- ─────────────────────────────────────────────────────────────────────────────

insert into properties (id, title, slug, description, status, property_type, price, price_period, bedrooms, bathrooms, toilets, parking, size_sqm, city, neighbourhood, address, features, is_featured, is_investment, investment_note, partner_id, agent_id) values
  (
    'c0000001-0000-0000-0000-000000000001',
    'Lekki Pearl Duplex',
    'lekki-pearl-duplex',
    'A stunning 3-bedroom duplex in the heart of Lekki Phase 1, featuring spacious living areas, modern finishes, and a private garden. The property boasts high ceilings, a fully fitted kitchen, and ample parking space within a gated estate.',
    'for_sale',
    'duplex',
    450000000,
    'total',
    3, 2, 3, 2, 180,
    'Lagos', 'Lekki Phase 1', '12 Admiralty Way, Lekki Phase 1',
    array['Swimming pool', '24/7 power', 'Gated estate', 'Borehole', 'CCTV'],
    true, true, 'Projected rental yield 12–15% p.a.',
    null, 'a0000001-0000-0000-0000-000000000001'
  ),
  (
    'c0000002-0000-0000-0000-000000000002',
    'Ikoyi Crown House',
    'ikoyi-crown-house',
    'An elegant 4-bedroom detached house in Ikoyi with manicured gardens, a swimming pool, and staff quarters. This property offers unparalleled privacy and luxury in one of Lagos''s most sought-after neighbourhoods.',
    'for_sale',
    'house',
    720000000,
    'total',
    4, 3, 4, 3, 220,
    'Lagos', 'Ikoyi', 'Banana Island Road, Ikoyi',
    array['Swimming pool', '24/7 power', 'Gated estate', 'Borehole', 'CCTV', 'Gym'],
    true, false, null,
    'b0000001-0000-0000-0000-000000000001', 'a0000001-0000-0000-0000-000000000001'
  ),
  (
    'c0000003-0000-0000-0000-000000000003',
    'Victoria Island Penthouse',
    'victoria-island-penthouse',
    'A breathtaking penthouse apartment with panoramic views of the Lagos lagoon. Features include a private elevator, wraparound terrace, and a state-of-the-art smart home system.',
    'for_sale',
    'apartment',
    1200000000,
    'total',
    4, 4, 4, 2, 280,
    'Lagos', 'Victoria Island', 'Adeola Odeku Street, V/I',
    array['24/7 power', 'Gym', 'CCTV', 'Smart home', 'Elevator'],
    true, true, 'Projected rental yield 10–14% p.a.',
    'b0000002-0000-0000-0000-000000000002', 'a0000001-0000-0000-0000-000000000001'
  ),
  (
    'c0000004-0000-0000-0000-000000000004',
    'Ajah Land Parcel',
    'ajah-land-parcel',
    '650 sqm of prime land in Ajah, ideal for residential development. The plot is in a rapidly appreciating area with good road access and proximity to the Lekki-Epe Expressway.',
    'for_sale',
    'land',
    85000000,
    'total',
    null, null, null, null, 650,
    'Lagos', 'Ajah', 'Off Lekki-Epe Expressway, Ajah',
    array['Gated estate', 'Good road access'],
    false, false, null,
    null, 'a0000001-0000-0000-0000-000000000001'
  ),
  (
    'c0000005-0000-0000-0000-000000000005',
    'Maitama Mansion',
    'maitama-mansion',
    'A palatial 5-bedroom mansion in Maitama, Abuja. Features include a home cinema, wine cellar, swimming pool, and beautifully landscaped grounds. The epitome of diplomatic-quarter luxury.',
    'for_sale',
    'house',
    680000000,
    'total',
    5, 5, 5, 4, 320,
    'Abuja', 'Maitama', 'Mississippi Street, Maitama',
    array['Swimming pool', '24/7 power', 'Gated estate', 'Borehole', 'CCTV', 'Gym', 'Home cinema'],
    true, false, null,
    'b0000001-0000-0000-0000-000000000001', 'a0000003-0000-0000-0000-000000000003'
  ),
  (
    'c0000006-0000-0000-0000-000000000006',
    'Gwarinpa Family Home',
    'gwarinpa-family-home',
    'A spacious 4-bedroom terrace duplex in Gwarinpa, Abuja. Perfect for families, with a large backyard, modern kitchen, and proximity to schools and shopping centres.',
    'for_sale',
    'terrace',
    320000000,
    'total',
    4, 3, 3, 2, 240,
    'Abuja', 'Gwarinpa', '1st Avenue, Gwarinpa',
    array['24/7 power', 'Borehole', 'Gated estate'],
    false, false, null,
    null, 'a0000003-0000-0000-0000-000000000003'
  ),
  (
    'c0000007-0000-0000-0000-000000000007',
    'Lekki Phase 1 Apartment',
    'lekki-phase-1-apartment',
    'A modern 2-bedroom apartment in a serviced estate in Lekki Phase 1. Features include a gym, swimming pool, and 24/7 security. Available for rent on a per-annum basis.',
    'for_rent',
    'apartment',
    12000000,
    'per_year',
    2, 2, 2, 1, 120,
    'Lagos', 'Lekki Phase 1', 'Admiralty Way, Lekki Phase 1',
    array['Swimming pool', '24/7 power', 'Gym', 'CCTV', 'Serviced'],
    false, false, null,
    null, 'a0000001-0000-0000-0000-000000000001'
  ),
  (
    'c0000008-0000-0000-0000-000000000008',
    'Banana Island Villa',
    'banana-island-villa',
    'An ultra-luxury 6-bedroom villa on Banana Island with private dock, infinity pool, and panoramic water views. This is one of the most exclusive properties in Lagos.',
    'sold',
    'house',
    2500000000,
    'total',
    6, 6, 6, 5, 450,
    'Lagos', 'Banana Island', 'Banana Island, Ikoyi',
    array['Swimming pool', '24/7 power', 'Gated estate', 'Borehole', 'CCTV', 'Gym', 'Home cinema', 'Private dock'],
    true, false, null,
    'b0000002-0000-0000-0000-000000000002', 'a0000001-0000-0000-0000-000000000001'
  ),
  (
    'c0000009-0000-0000-0000-000000000009',
    'Yaba Modern Apartment',
    'yaba-modern-apartment',
    'A contemporary 2-bedroom apartment in the tech hub of Yaba. Features include modern fittings, ample natural light, and proximity to co-working spaces and restaurants.',
    'for_sale',
    'apartment',
    95000000,
    'total',
    2, 2, 2, 1, 120,
    'Lagos', 'Yaba', 'Herbert Macaulay Way, Yaba',
    array['24/7 power', 'CCTV'],
    false, false, null,
    null, 'a0000001-0000-0000-0000-000000000001'
  ),
  (
    'c0000010-0000-0000-0000-000000000010',
    'Lekki Phase 1 Investment Duplex',
    'lekki-phase-1-investment-duplex',
    'A 4-bedroom duplex in Lekki Phase 1 with strong rental potential. Currently tenanted, generating steady income. An excellent buy-to-let opportunity for investors.',
    'for_sale',
    'duplex',
    520000000,
    'total',
    4, 3, 3, 2, 200,
    'Lagos', 'Lekki Phase 1', 'Admiralty Way, Lekki Phase 1',
    array['24/7 power', 'Gated estate', 'Borehole', 'CCTV'],
    false, true, 'Projected rental yield 12–15% p.a. Currently tenanted.',
    null, 'a0000001-0000-0000-0000-000000000001'
  );

-- ─────────────────────────────────────────────────────────────────────────────
-- Property Images (using Unsplash URLs as placeholders)
-- ─────────────────────────────────────────────────────────────────────────────

-- Helper: we store full Unsplash URLs in storage_path for seed data.
-- The app's getStorageUrl() will need to handle full URLs (see lib/storage.ts).

insert into property_images (property_id, storage_path, sort_order, alt) values
  ('c0000001-0000-0000-0000-000000000001', 'https://picsum.photos/seed/lekki-pearl-1/1200/900', 0, 'Lekki Pearl Duplex exterior'),
  ('c0000001-0000-0000-0000-000000000001', 'https://picsum.photos/seed/lekki-pearl-2/1200/900', 1, 'Lekki Pearl Duplex living room'),
  ('c0000002-0000-0000-0000-000000000002', 'https://picsum.photos/seed/ikoyi-crown-1/1200/900', 0, 'Ikoyi Crown House exterior'),
  ('c0000002-0000-0000-0000-000000000002', 'https://picsum.photos/seed/ikoyi-crown-2/1200/900', 1, 'Ikoyi Crown House garden'),
  ('c0000003-0000-0000-0000-000000000003', 'https://picsum.photos/seed/vi-penthouse-1/1200/900', 0, 'Victoria Island Penthouse'),
  ('c0000003-0000-0000-0000-000000000003', 'https://picsum.photos/seed/vi-penthouse-2/1200/900', 1, 'Penthouse terrace view'),
  ('c0000004-0000-0000-0000-000000000004', 'https://picsum.photos/seed/ajah-land/1200/900', 0, 'Ajah land parcel'),
  ('c0000005-0000-0000-0000-000000000005', 'https://picsum.photos/seed/maitama-1/1200/900', 0, 'Maitama Mansion exterior'),
  ('c0000005-0000-0000-0000-000000000005', 'https://picsum.photos/seed/maitama-2/1200/900', 1, 'Maitama Mansion interior'),
  ('c0000006-0000-0000-0000-000000000006', 'https://picsum.photos/seed/gwarinpa/1200/900', 0, 'Gwarinpa Family Home'),
  ('c0000007-0000-0000-0000-000000000007', 'https://picsum.photos/seed/lekki-apt/1200/900', 0, 'Lekki Phase 1 Apartment'),
  ('c0000008-0000-0000-0000-000000000008', 'https://picsum.photos/seed/banana-island/1200/900', 0, 'Banana Island Villa'),
  ('c0000009-0000-0000-0000-000000000009', 'https://picsum.photos/seed/yaba-apt/1200/900', 0, 'Yaba Modern Apartment'),
  ('c0000010-0000-0000-0000-000000000010', 'https://picsum.photos/seed/lekki-invest/1200/900', 0, 'Lekki Phase 1 Investment Duplex');

-- ─────────────────────────────────────────────────────────────────────────────
-- Investment Opportunities
-- ─────────────────────────────────────────────────────────────────────────────

insert into investment_opportunities (id, title, slug, description, status, investment_type, city, neighbourhood, roi_range, min_entry, duration, is_featured, agent_id) values
  (
    'd0000001-0000-0000-0000-000000000001',
    'Lekki Pearl Estate — Off-Plan Terraces',
    'lekki-pearl-estate-off-plan-terraces',
    'An exclusive off-plan development of 24 luxury terraces in Lekki Phase 1. Early investors benefit from pre-completion pricing with projected capital appreciation of 15–20% upon delivery. The development features a swimming pool, gym, and 24/7 security.',
    'open',
    'off_plan',
    'Lagos', 'Lekki Phase 1',
    '15–20% p.a. projected',
    25000000,
    '18–24 months',
    true, 'a0000002-0000-0000-0000-000000000002'
  ),
  (
    'd0000002-0000-0000-0000-000000000002',
    'Ajah Acres — Land Banking',
    'ajah-acres-land-banking',
    'Strategic land acquisition in the rapidly developing Ajah corridor. With the Lekki-Epe Expressway expansion and new infrastructure projects, land values in this area are projected to appreciate significantly over the next 24–36 months.',
    'open',
    'land_banking',
    'Lagos', 'Ajah',
    '12–18% p.a. projected',
    15000000,
    '24–36 months',
    true, 'a0000002-0000-0000-0000-000000000002'
  ),
  (
    'd0000003-0000-0000-0000-000000000003',
    'Ikoyi Buy-to-Let Units',
    'ikoyi-buy-to-let-units',
    'A portfolio of furnished apartments in Ikoyi targeting the expatriate rental market. Strong demand and premium rental yields make this an attractive income-generating investment.',
    'closing_soon',
    'buy_to_let',
    'Lagos', 'Ikoyi',
    '10–14% p.a. projected',
    40000000,
    '12–18 months',
    false, 'a0000002-0000-0000-0000-000000000002'
  ),
  (
    'd0000004-0000-0000-0000-000000000004',
    'Eko Towers — Mixed Development',
    'eko-towers-mixed-development',
    'A mixed-use development in Victoria Island combining residential apartments with retail space. This project has been completed and all units sold.',
    'closed',
    'development',
    'Lagos', 'Victoria Island',
    '18–25% p.a. projected',
    50000000,
    '24–30 months',
    false, 'a0000002-0000-0000-0000-000000000002'
  );

-- Investment images
insert into investment_images (opportunity_id, storage_path, sort_order, alt) values
  ('d0000001-0000-0000-0000-000000000001', 'https://picsum.photos/seed/inv-lekki-pearl-1/1200/900', 0, 'Lekki Pearl Estate rendering'),
  ('d0000001-0000-0000-0000-000000000001', 'https://picsum.photos/seed/inv-lekki-pearl-2/1200/900', 1, 'Lekki Pearl Estate location'),
  ('d0000002-0000-0000-0000-000000000002', 'https://picsum.photos/seed/inv-ajah/1200/900', 0, 'Ajah land'),
  ('d0000003-0000-0000-0000-000000000003', 'https://picsum.photos/seed/inv-ikoyi/1200/900', 0, 'Ikoyi apartment'),
  ('d0000004-0000-0000-0000-000000000004', 'https://picsum.photos/seed/inv-eko-towers/1200/900', 0, 'Eko Towers');

-- ─────────────────────────────────────────────────────────────────────────────
-- Sample Inquiries
-- ─────────────────────────────────────────────────────────────────────────────

insert into inquiries (kind, property_id, opportunity_id, name, phone, email, message, preferred_date, is_read) values
  ('viewing', 'c0000001-0000-0000-0000-000000000001', null, 'John Doe', '+234 803 111 2222', 'john@example.com', 'I would like to view this property on Saturday morning.', '2026-07-28', false),
  ('contact', null, null, 'Jane Smith', '+234 805 333 4444', 'jane@example.com', 'Do you have any 3-bedroom apartments in Ikoyi?', null, true),
  ('investment', null, 'd0000001-0000-0000-0000-000000000001', 'Mike Ade', '+234 807 555 6666', 'mike@example.com', 'I am interested in the off-plan terraces. Can we schedule a meeting?', null, false);