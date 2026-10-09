-- Structured pricing/terms so land and buyback listings render as comparison
-- cards instead of long description paragraphs. All columns are nullable, so
-- existing listings keep working untouched.
--
-- APPLY THIS BEFORE deploying the code that queries these columns, otherwise
-- every page that selects them returns a GraphQL "field not found" error.
-- Then reload Hasura metadata (Nhost → Hasura → Settings → Reload) so the new
-- columns are exposed.

alter table public.properties
  add column if not exists plot_options jsonb,
  add column if not exists payment_terms jsonb;

alter table public.investment_opportunities
  add column if not exists advertised_returns jsonb;

comment on column public.properties.plot_options is
  '[{ "size_sqm": 300, "price": 18000000, "initial_deposit": 1000000, "suggested_use": "..." }]';
comment on column public.properties.payment_terms is
  '{ "title_doc": "...", "payment_plan": "...", "highlights": ["..."], "disclaimer": "..." }';
comment on column public.investment_opportunities.advertised_returns is
  '[{ "term": "6 months", "return": "20%" }] — developer-advertised, not guaranteed';

-- Lekki Avana Signature: move the repeated per-plot paragraphs into data.
update public.properties set
  description = 'Lekki Avana Signature Resort Palm Estate offers four advertised land plot sizes in Eleranigbe, Lekki-Epe, Lagos. The developer''s flyers state a government-allocated Certificate of Occupancy. Compare the plot options and payment terms below, then enquire to confirm current prices, payment schedule, title documents and full terms.',
  plot_options = '[
    {"size_sqm": 300,  "price": 18000000, "initial_deposit": 1000000, "suggested_use": "3 or 4-bedroom fully detached duplex"},
    {"size_sqm": 500,  "price": 30000000, "initial_deposit": 1000000, "suggested_use": "5-bedroom fully detached duplex"},
    {"size_sqm": 600,  "price": 36000000, "initial_deposit": 1000000, "suggested_use": "5-bedroom fully detached duplex"},
    {"size_sqm": 1000, "price": 70000000, "initial_deposit": 5000000, "suggested_use": "Commercial or apartment development"}
  ]'::jsonb,
  payment_terms = '{
    "title_doc": "Government-allocated C of O",
    "payment_plan": "6 months interest-free (advertised)",
    "highlights": [
      "Six months interest-free is advertised.",
      "Payment of ₦5M qualifies for physical allocation.",
      "Possession is subject to full payment.",
      "The ₦1M initial deposit and the ₦5M physical-allocation payment are separate amounts for the 300, 500 and 600 m² options."
    ],
    "disclaimer": "Prices, documents and payment terms should be confirmed before commitment."
  }'::jsonb
where slug = 'lekki-avana-signature-land-plots';

-- Landview buyback: developer-advertised figures (both plans: 1.2x / 1.45x / 1.7x).
update public.investment_opportunities set
  advertised_returns = '[
    {"term": "6 months",  "return": "20%"},
    {"term": "12 months", "return": "45%"},
    {"term": "18 months", "return": "70%"}
  ]'::jsonb
where slug = 'landview-buyback-ibefun-asaba';
