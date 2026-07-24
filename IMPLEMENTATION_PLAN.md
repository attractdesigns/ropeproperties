# RopeProperties — Website Implementation Plan

**Audience:** an autonomous coding agent building this project from scratch.
**Working directory:** `C:\Users\ATR\ropeproperties` (this folder — build the app here).

---

## 0. Build status (updated 2026-07-24)

Phases 1–6 are implemented. All 28 routes build, typecheck (`npx tsc --noEmit`) and lint clean,
and every public page plus the admin guard was smoke-tested against a running server.
See `README.md` for setup and the client handover guide.

**Verified locally:** public pages render, `/admin` redirects to `/admin/login` while the login
page itself loads, 404 handling, inquiry API honeypot / validation / rate limiting.

**Not yet verified — needs real credentials or client input:**
- `.env.local` still holds a placeholder Supabase anon key, so nothing has been run against a
  live database. Migration and seed SQL have been checked for validity but never executed.
- Data-driven rendering (listings, opportunities, images, admin CRUD, auth login) is therefore
  untested end-to-end. Do this first once real Supabase keys exist.
- Lighthouse pass and Vercel deployment (Phase 6) still outstanding.
- Content placeholders remain as designed — see the table at the end of `README.md`.

---

## 1. Project summary

A public marketing + listings website for **RopeProperties**, a Nigerian realtor firm, with a private, professional **admin dashboard** where staff add, edit, and remove property listings (with photo uploads) and review inquiries.

The firm also offers **property investment**: clients can invest in opportunities the firm packages (off-plan developments, land banking, buy-to-let deals). The site presents a dedicated investment opportunities catalogue **and** can flag ordinary listings as investment-worthy. Returns are shown only as **indicative teaser ranges** (e.g. "15–20% p.a. projected") with a disclaimer; all commitments and payments happen **offline** — the site's job is to generate investment leads via a contact form and WhatsApp.

**Design north star:** the Framer templates ["Ambience"](https://www.framer.com/community/marketplace/templates/ambience/) and ["Real"](https://www.framer.com/community/marketplace/templates/real/) — light, minimal luxury. Cream/off-white backgrounds, large full-bleed property photography, elegant serif display type, generous whitespace, restrained animation. The site should feel premium and calm, never busy.

**Confirmed decisions (do not re-ask):**
- Custom-coded (not Framer). Stack: **Next.js + Supabase**, deployed on **Vercel**.
- Listings managed **manually** through a custom admin dashboard.
- Market: **Nigeria** — prices in NGN (₦), sizes in m², +234 phone formats, WhatsApp is a primary contact channel.
- Pages for v1: Home, Listings + property detail, **Invest + opportunity detail**, About/Team (agents), Contact & viewing requests, Admin.
- Investments: dedicated opportunities catalogue **and** an `is_investment` flag on regular listings; ROI shown as teaser ranges only, with disclaimer; lead capture = simple contact form + WhatsApp deep link; **no online payments** — everything transacts offline.
- Client has **property photos and listing data** ready to load. Client has **no logo or brand guide** — create a typographic wordmark and brand system as part of this build (see §3).

---

## 2. Tech stack

| Layer | Choice | Notes |
|---|---|---|
| Framework | Next.js 15 (App Router, TypeScript) | `npx create-next-app@latest` |
| Styling | Tailwind CSS v4 | Design tokens in CSS variables |
| Database | Supabase Postgres | Free tier |
| Auth | Supabase Auth (email/password) | Admin-only; public signups **disabled** |
| File storage | Supabase Storage | Bucket `property-images`, public read |
| Forms/validation | react-hook-form + zod | Both public forms and admin forms |
| Gallery/carousel | `embla-carousel-react` | Lightweight, no jQuery-era libs |
| Icons | `lucide-react` | Thin-stroke icons fit the aesthetic |
| Maps | Google Maps **embed iframe** per property (no API key billing) | Store a `map_embed_url` or lat/lng per property |
| Hosting | Vercel | Env vars set in dashboard |

Supabase client usage: `@supabase/supabase-js` + `@supabase/ssr` for server components/route handlers. Never expose the service-role key to the browser; use it only in server-side admin mutations if needed (RLS should make this mostly unnecessary).

---

## 3. Brand & design system

Since no logo exists, create a **typographic wordmark**: `ROPE` in the display serif, letter-spaced, with `PROPERTIES` in small caps sans underneath or beside it. Render it as an SVG component (`components/Logo.tsx`) so it scales crisply and can be reused in the footer/admin/favicon.

**Typography (Google Fonts via `next/font`):**
- Display/headlines: **Playfair Display** — used for hero lines, section titles, prices on detail pages, and the wordmark. High-contrast, editorial serif; keep it at generous sizes (it's a display face — don't use it below ~20px or for body text).
- Body/UI: **Inter** — everything else, including the admin.

**Color tokens (CSS variables, Tailwind theme):** pure-white canvas with cool greys; golden brown is the single warm accent and only appears where attention should go (prices, CTAs, wordmark, badges, ROI ranges).
- `--bg: #FFFFFF` (pure white) · `--surface: #F6F7F8` (cool light grey — alternating sections, cards, admin panels; replaces cream for section separation)
- `--ink: #17191C` (cool near-black) · `--muted: #5F656D` (cool grey secondary text)
- `--accent: #A1804A` (golden brown — links, buttons, price highlights) · `--accent-deep: #84683A` (hover/active)
- `--accent-tint: #F5F0E6` (pale gold wash — badge backgrounds, e.g. "Featured", "Investment opportunity")
- `--line: #E4E6E9` (cool hairline borders)
- Status colors kept desaturated (e.g. sold badge in `--ink`, rent badge in `--accent`).

**Layout rules:** max content width ~1200px; hero and featured imagery may go full-bleed; 8-pt spacing scale; hairline 1px borders instead of shadows; card corners subtle (`rounded-md` max). Buttons: solid ink primary, ghost/outline secondary — no gradients.

**Motion:** subtle only — fade/translate-up on scroll-into-view (IntersectionObserver or CSS), image hover scale 1.03 with slow ease, page transitions omitted. Respect `prefers-reduced-motion`.

**Nigeria formatting helpers (`lib/format.ts`):**
- `formatPrice(n)` → `₦450,000,000`; also `formatPriceCompact(n)` → `₦450M` for cards. Rent prices append `/year` (per-annum is the Nigerian norm) via a `price_period` field.
- Phone display `+234 XXX XXX XXXX`; WhatsApp deep links `https://wa.me/234XXXXXXXXXX?text=<url-encoded message referencing the property title>`.
- Areas in m².

---

## 4. Data model (Supabase)

Write this as a SQL migration and run it via the Supabase SQL editor or CLI. Use `snake_case`.

```sql
-- properties
create table properties (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  title text not null,
  slug text not null unique,          -- generated from title, editable in admin
  description text not null default '',
  status text not null default 'draft'
    check (status in ('draft','for_sale','for_rent','sold','let')),
  property_type text not null
    check (property_type in ('apartment','house','duplex','terrace','bungalow','land','commercial')),
  price numeric not null default 0,           -- NGN
  price_period text not null default 'total'  -- 'total' | 'per_year' (rent)
    check (price_period in ('total','per_year')),
  bedrooms int, bathrooms int, toilets int, parking int,
  size_sqm numeric,
  city text not null,                 -- e.g. 'Lagos'
  neighbourhood text,                 -- e.g. 'Lekki Phase 1'
  address text,                       -- shown only partially publicly if desired
  features text[] not null default '{}',  -- amenities: 'Swimming pool', '24/7 power', 'Gated estate', ...
  map_embed_url text,
  is_featured boolean not null default false,
  is_investment boolean not null default false,  -- flags this listing as an investment opportunity
  investment_note text,               -- optional teaser shown when flagged, e.g. 'Projected rental yield 12–15% p.a.'
  partner_id uuid references partner_companies(id) on delete set null,  -- null = RopeProperties' own listing
  agent_id uuid references agents(id) on delete set null
);

-- partner_companies (real estate firms whose properties RopeProperties also lists)
-- NOTE: create this table BEFORE properties in the migration (properties references it).
create table partner_companies (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  logo_path text,                     -- in the property-images bucket under partners/ ; text fallback = name
  website_url text,
  description text,                   -- one-liner shown in the partners section
  sort_order int not null default 0,
  is_active boolean not null default true
);

-- property_images (ordered gallery; first = cover)
create table property_images (
  id uuid primary key default gen_random_uuid(),
  property_id uuid not null references properties(id) on delete cascade,
  storage_path text not null,         -- path in the property-images bucket
  sort_order int not null default 0,
  alt text
);

-- investment_opportunities (dedicated investment catalogue, separate from listings)
create table investment_opportunities (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  title text not null,                -- e.g. 'Lekki Pearl Estate — Off-Plan Terraces'
  slug text not null unique,
  description text not null default '',
  status text not null default 'draft'
    check (status in ('draft','open','closing_soon','closed')),
  investment_type text not null
    check (investment_type in ('off_plan','land_banking','buy_to_let','development','flip')),
  city text not null,
  neighbourhood text,
  roi_range text,                     -- teaser only, e.g. '15–20% p.a. projected' — never a guarantee
  min_entry numeric,                  -- optional indicative minimum (NGN); display compact, e.g. 'From ₦25M'
  duration text,                      -- e.g. '18–24 months'
  map_embed_url text,
  is_featured boolean not null default false,
  agent_id uuid references agents(id) on delete set null
);

-- investment_images (same pattern as property_images; first = cover)
create table investment_images (
  id uuid primary key default gen_random_uuid(),
  opportunity_id uuid not null references investment_opportunities(id) on delete cascade,
  storage_path text not null,         -- same property-images bucket, under investments/ prefix
  sort_order int not null default 0,
  alt text
);

-- agents (team members)
create table agents (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  role text not null default 'Agent',
  phone text, whatsapp text, email text,
  photo_path text,
  bio text,
  sort_order int not null default 0,
  is_active boolean not null default true
);

-- inquiries (contact + viewing requests)
create table inquiries (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  kind text not null check (kind in ('contact','viewing','investment')),
  property_id uuid references properties(id) on delete set null,
  opportunity_id uuid references investment_opportunities(id) on delete set null,  -- investment inquiries
  name text not null,
  phone text not null,
  email text,
  message text,
  preferred_date date,                -- viewing requests
  is_read boolean not null default false
);
```

**RLS (enable on all tables):**
- `properties`, `property_images`, `agents`: public (`anon`) **select** only where published (`status <> 'draft'` for properties; `is_active` for agents; images join through their property). `authenticated` role: full CRUD.
- `investment_opportunities`, `investment_images`: same pattern — `anon` select where `status <> 'draft'` (images join through their opportunity); `authenticated` full CRUD.
- `partner_companies`: `anon` select where `is_active`; `authenticated` full CRUD.
- `inquiries`: `anon` **insert** only; `authenticated` select/update/delete.
- Storage bucket `property-images`: public read, authenticated write.

**Auth:** disable public signups in Supabase Auth settings. Create the admin user manually in the Supabase dashboard. The app never offers a sign-up flow — only `/admin/login`.

**Seed data:** create `supabase/seed.sql` with 8–10 realistic placeholder listings (Lagos: Lekki, Ikoyi, Victoria Island, Ajah; Abuja: Maitama, Gwarinpa), 3 agents, 3–4 investment opportunities (mix of off-plan, land banking, buy-to-let, with teaser ROI ranges), and 2–3 partner companies (typographic placeholder logos; assign a few listings to them via `partner_id`), using stock-style placeholder images uploaded to the bucket (or Unsplash URLs stored temporarily). Mark 1–2 regular listings `is_investment = true`. The client will replace these with real data through the admin.

---

## 5. Site structure & pages (public)

Routes under `app/`:

### 5.1 `/` — Home
1. **Hero:** full-viewport photo of a premium property, wordmark/nav overlaid (transparent header → solid on scroll), serif headline (e.g. "Find a place you'll love to call home"), one CTA → `/listings`.
2. **Featured listings:** up to 6 `is_featured` properties as cards (cover image, title, neighbourhood + city, beds/baths/size icon row, compact price). Card links to detail page.
3. **About teaser:** short firm intro, photo, link to `/about`.
3b. **Partners strip:** "In partnership with" — a slim row of active partner-company logos (greyscale/muted treatment to keep the palette calm; text wordmark fallback when no logo), linking to `/about#partners`. Hide if none active.
4. **How it works / services strip:** 4 columns (Buy, Rent, **Invest**, Sell/Manage) — static content; Invest column links to `/invest`.
5. **Investment teaser band:** 2–3 featured open opportunities as cards (cover, title, type badge, ROI range, "From ₦XXM") + "Explore investments" CTA → `/invest`. Hide the band if none are open.
6. **CTA band:** "Looking for something specific?" → contact, plus WhatsApp button.
7. **Footer:** wordmark, nav, office address, +234 phone, WhatsApp, email, social links, copyright.

### 5.2 `/listings` — All listings
- Server component fetching all published properties, newest first.
- **Filter bar** (URL-param driven so results are shareable): status (Buy/Rent), property type, bedrooms (1–5+), city/neighbourhood, price min/max. Keep it to one slim row + "Filters" popover on mobile.
- Responsive card grid (3 / 2 / 1 columns). Empty state with a "contact us" prompt.
- Pagination or "load more" after 12.

### 5.3 `/listings/[slug]` — Property detail
- **Gallery:** large embla carousel + thumbnail strip; lightbox on click.
- **Header row:** title, neighbourhood/city, status badge, serif price (with `/year` when rent).
- **Listing attribution:** every property shows who owns the listing — partner company logo (or name as styled text if no logo) with a "Listed by {Partner}" label when `partner_id` is set, otherwise "Listed by RopeProperties" with the wordmark. On **cards** (listings grid, home, invest page) this is a small corner chip/logo; on the **detail page** it sits near the agent card, with the partner's website link if present.
- **Spec grid:** beds, baths, toilets, parking, size m², type.
- **Description** (rendered from stored text, preserve paragraphs).
- **Features/amenities** checklist chips.
- **Map:** embedded iframe if `map_embed_url` present.
- **Agent card:** assigned agent with photo, call button (`tel:`), WhatsApp button with pre-filled message containing the property title + URL.
- **"Request a viewing" form:** name, phone, email (optional), preferred date, message → inserts `inquiries(kind='viewing', property_id=…)`. Show success state inline.
- `generateMetadata` per property (title, description, OG image = cover photo). Add JSON-LD `RealEstateListing` structured data.
- Sold/let properties remain viewable with a prominent SOLD badge and no viewing form.
- **If `is_investment`:** show an "Investment opportunity" badge (accent-styled, alongside the status badge, also on cards in `/listings` and home) and, when present, the `investment_note` teaser line near the price. Add a secondary "Enquire about investing" CTA: WhatsApp deep link pre-filled with the property title + URL, plus the inquiry form gains an "I'm interested in investing" checkbox that submits `kind='investment'` instead of `'viewing'`.

### 5.4 `/invest` — Investment opportunities

- **Intro section:** short "Invest with RopeProperties" pitch (how it works in 3 steps: enquire → meet the team → invest offline) — tasteful placeholder copy the client will edit.
- **Opportunities grid:** all published opportunities (`open` and `closing_soon` first, then `closed` with a muted CLOSED badge), cards showing cover image, title, neighbourhood/city, type badge, `roi_range`, `min_entry` compact ("From ₦25M"), duration.
- Also list regular listings flagged `is_investment = true` in a separate "Investment-grade listings" row linking to their normal detail pages.
- **Disclaimer strip** (small muted text, also on detail pages): projected figures are indicative estimates, not guarantees; investments carry risk; terms discussed directly with the team.

### 5.5 `/invest/[slug]` — Opportunity detail

- Same visual language as property detail: embla gallery, serif title, type + status badges.
- **Key facts grid:** investment type, location, ROI range (labelled "Projected"), minimum entry, duration.
- Description, map embed if present, assigned agent card.
- **"Register interest" form:** name, phone, email (optional), message → `inquiries(kind='investment', opportunity_id=…)`; beside it a prominent WhatsApp button pre-filled with the opportunity title + URL. No payments, no amounts collected — this is lead capture only.
- `closed` opportunities stay viewable with a CLOSED badge and no form. `generateMetadata` + OG image from cover photo.

### 5.6 `/about` — About & team
- Firm story section (placeholder copy the client will edit — write tasteful, non-generic copy about a Lagos-based firm).
- Values/stats row (years, properties sold, clients — placeholders clearly marked in code comments as editable).
- **Team grid** from `agents` table: photo, name, role, phone/WhatsApp/email icons.
- **Partners section** (`id="partners"`): grid of active partner companies — logo (or typographic fallback), name, one-line description, website link. Short intro line: RopeProperties also markets select properties from trusted partner firms.

### 5.7 `/contact` — Contact
- Split layout: form (name, phone, email, message → `inquiries(kind='contact')`) beside office info: address, phone, WhatsApp CTA, hours, office map embed.

### 5.8 Shared
- `components/`: `Logo`, `Header` (transparent-over-hero variant), `Footer`, `PropertyCard`, `OpportunityCard`, `PriceTag`, `StatusBadge`, `InvestmentBadge`, `PartnerBadge` ("Listed by …" chip + logo), `SpecIcons`, `Section`, `WhatsAppButton`, form primitives.
- Nav gains an **Invest** item (Home · Listings · Invest · About · Contact).
- `not-found.tsx` styled to brand. `sitemap.ts` and `robots.ts` generated. Favicon from the wordmark "R".

---

## 6. Admin section (`/admin`)

Design: same design tokens but denser/utilitarian — this must feel professionally built, not an afterthought. Sidebar layout: Dashboard, Listings, Investments, Inquiries, Agents, Partners, Log out.

- **`/admin/login`** — email + password via Supabase Auth. Middleware (`middleware.ts`) protects everything under `/admin` except `/admin/login`; redirect unauthenticated users there.
- **`/admin` (dashboard)** — stat cards: published listings, drafts, open investment opportunities, unread inquiries; list of 5 latest inquiries.
- **`/admin/listings`** — table of all properties (cover thumb, title, status, price, city, partner badge if any, featured toggle, updated date), search box, status filter. Row actions: Edit, Delete (confirm dialog).
- **`/admin/listings/new` and `/admin/listings/[id]/edit`** — one form component for both:
  - All property fields; slug auto-generated from title but editable; features entered as tag input; status select; featured toggle; **investment toggle** (`is_investment`) revealing the `investment_note` teaser field; **partner select** ("Listed by" — RopeProperties (default) or an active partner company).
  - **Image manager:** drag-and-drop multi-upload straight to Supabase Storage (client-side, with upload progress), thumbnails reorderable via drag (persist `sort_order`), first image labelled "Cover", per-image delete. Compress/resize client-side before upload (max ~1920px wide) to keep the bucket lean.
  - Save = upsert property + reconcile `property_images`. Zod-validate. Toast feedback on success/error.
- **`/admin/investments`**, **`/admin/investments/new`**, **`/admin/investments/[id]/edit`** — mirror the listings CRUD for `investment_opportunities`: table (cover thumb, title, type, status, ROI range, city, featured toggle), one form for new/edit with all fields, and the same image-manager component reused against `investment_images`.
- **`/admin/inquiries`** — table with kind badge (contact / viewing / **investment**), linked property **or opportunity**, contact details (tap-to-call / WhatsApp), message, read/unread toggle, delete. Filter by kind so investment leads are easy to isolate.
- **`/admin/agents`** — CRUD list with photo upload, active toggle, drag ordering.
- **`/admin/partners`** — CRUD list for partner companies: logo upload (to `partners/` in the bucket), name, description, website, active toggle, drag ordering. Deleting a partner leaves its listings intact (`partner_id` set null → shown as RopeProperties').

All admin mutations go through Next.js **server actions** (or route handlers) using the user's Supabase session — RLS enforces auth. Revalidate affected public paths (`revalidatePath`) after mutations so the public site updates immediately.

---

## 7. Build phases & acceptance criteria

Work in this order; each phase should build and run cleanly before moving on.

**Phase 1 — Scaffold & design system.** Next.js + Tailwind + fonts + tokens + `Logo`, `Header`, `Footer`, home hero with placeholder image. ✅ `npm run dev` shows a branded shell; lint passes.

**Phase 2 — Supabase.** Create migration SQL (tables, RLS, bucket policies) in `supabase/migrations/`, seed script, typed client helpers (`lib/supabase/server.ts`, `lib/supabase/client.ts`), generated DB types. ✅ Seed data queryable; anon key cannot write; RLS verified.

**Phase 3 — Public pages.** Home (with real featured query, investment teaser band, partners strip), listings + filters, property detail (gallery, specs, agent card, partner attribution, investment badge/CTA, JSON-LD), invest catalogue + opportunity detail, about/team/partners, contact. ✅ All pages render seed data, fully responsive at 375 / 768 / 1440 widths, images via `next/image` with proper `sizes`.

**Phase 4 — Forms & inquiries.** Viewing-request, contact, and register-interest (investment) forms writing to `inquiries`, WhatsApp deep links, success/error states, honeypot field + basic rate limiting for spam. ✅ Submissions appear in DB with the right `kind` and property/opportunity link; invalid input rejected with inline messages.

**Phase 5 — Admin.** Login + middleware guard, dashboard, listings CRUD with the image manager (incl. investment toggle + partner select), investments CRUD (reusing the image manager), inquiries inbox with kind filter, agents CRUD, partners CRUD, path revalidation. ✅ Full listing lifecycle works: create with photos → appears on public site → edit → unpublish/delete → disappears. Same lifecycle verified for an investment opportunity and a partner (logo appears on its listings and in the partners section). Logged-out users can't reach any admin route or mutate data.

**Phase 6 — Polish & deploy.** SEO metadata + OG images + sitemap, 404 page, `prefers-reduced-motion`, Lighthouse pass (target ≥90 performance/SEO on public pages), deploy to Vercel with env vars, README with setup + client handover instructions (how to log in, add a listing, replace seed data). ✅ Production URL live end-to-end.

---

## 8. Environment & config

`.env.local` (document in README; never commit):
```
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...   # server-only, only if actually needed
NEXT_PUBLIC_SITE_URL=https://ropeproperties.com   # placeholder until domain confirmed
NEXT_PUBLIC_WHATSAPP_NUMBER=234XXXXXXXXXX          # placeholder — client to supply
```

Open items the client must supply later (leave clearly-marked placeholders, do not block on them): real office address & phone/WhatsApp numbers, social links, final domain, real listing data (loaded via admin), agent photos/bios, firm story copy edits, real investment opportunities + final ROI teaser wording, partner company names/logos/links, legal review of the investment disclaimer text.

---

## 9. Out of scope for v1 (do not build)

MLS/IDX feeds, mortgage calculators, saved favourites/user accounts, blog, multi-language, payment processing, email notifications for inquiries (in-admin inbox + WhatsApp is sufficient; email notify can be a v2 via Resend).

Investment-specific exclusions: **no online payments or commitments** (all transactions offline), no investor accounts/portal or dashboards, no ROI calculators, no per-investor documents, no precise return figures (teaser ranges + disclaimer only). Partner-specific exclusions: no partner logins or self-service portals — partners' listings are managed by RopeProperties staff through the same admin.
