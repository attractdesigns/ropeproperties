# RopeProperties

A premium real estate website for a Nigerian realtor firm, built with Next.js + Supabase.

## Features

- **Public site:** Home, Listings (with filters), Property detail (gallery, specs, agent card, viewing form), Investment opportunities catalogue + detail, About/Team, Contact
- **Admin dashboard:** Login-protected, Listings CRUD with image manager, Investments CRUD, Inquiries inbox, Agents CRUD, Partners CRUD
- **Investment features:** Dedicated opportunities catalogue + `is_investment` flag on regular listings, ROI teaser ranges with disclaimer, lead capture forms + WhatsApp
- **Nigeria-specific:** NGN pricing, m² areas, +234 phone formatting, WhatsApp deep links
- **SEO:** Per-page metadata, OG images, JSON-LD structured data, sitemap, robots.txt

## Tech Stack

- Next.js 15 (App Router, TypeScript)
- Tailwind CSS v4
- Supabase (Postgres, Auth, Storage)
- react-hook-form + zod (forms)
- embla-carousel-react (galleries)
- lucide-react (icons)

## Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment variables

Create `.env.local`:

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
NEXT_PUBLIC_SITE_URL=https://ropeproperties.com
NEXT_PUBLIC_WHATSAPP_NUMBER=2348000000000
```

### 3. Set up the database

1. Go to your Supabase project's SQL Editor
2. Run `supabase/migrations/00001_initial.sql` — creates all tables, RLS policies, and storage bucket
3. Run `supabase/seed.sql` — inserts sample data (10 properties, 4 investment opportunities, 3 agents, 2 partners, sample inquiries)

### 4. Configure Supabase Auth

1. In Supabase Dashboard → Authentication → Settings:
   - **Disable public signups** (set "Allow new users to sign up" to off)
2. In Authentication → Users → "Add user":
   - Create the admin user with email + password
   - This is the account used to log in at `/admin/login`

### 5. Run the dev server

```bash
npm run dev
```

Visit `http://localhost:3000`.

## Admin Access

- **Login URL:** `/admin/login`
- Use the admin user created in Supabase Auth
- All routes under `/admin` are protected by middleware — unauthenticated users are redirected to login

## Client Handover

### How to add a listing

1. Log in at `/admin/login`
2. Go to **Listings** → **+ New Listing**
3. Fill in the details (title, price, type, location, etc.)
4. Upload photos via drag-and-drop — the first image is the cover
5. Toggle **Featured** to show on the home page
6. Toggle **Investment opportunity** if the property is investment-worthy
7. Select an agent and/or partner company
8. Click **Save Listing**

### How to manage inquiries

1. Go to **Inquiries** in the admin sidebar
2. View all contact, viewing, and investment inquiries
3. Click the phone/WhatsApp icons to contact the lead directly
4. Toggle read/unread status

### How to add an investment opportunity

1. Go to **Investments** → **+ New Opportunity**
2. Fill in type, ROI range (teaser), minimum entry, duration
3. Upload photos
4. Set status (Open, Closing Soon, Closed)
5. Save

### Replacing seed data

The seed data includes placeholder listings with Unsplash images. Replace these through the admin dashboard:
1. Edit or delete seed listings
2. Add real listings with real photos
3. Update agent bios and photos in **Agents**
4. Add real partner companies in **Partners**

## Deployment (Vercel)

1. Push to GitHub
2. Import the repo in Vercel
3. Add all environment variables in the Vercel dashboard
4. Deploy

## Project Structure

```
app/
  about/          # About + team page
  admin/          # Admin dashboard (protected)
    login/
    listings/     # Listings CRUD
    investments/  # Investment opportunities CRUD
    inquiries/    # Inquiries inbox
    agents/       # Agents CRUD
    partners/     # Partners CRUD
  api/
    inquiries/    # Public inquiry submission
    admin/        # Admin mutation routes
  contact/        # Contact page
  invest/         # Investment catalogue + detail
  listings/       # Listings grid + property detail
components/
  admin/          # Admin-specific components
  forms/          # Public forms (viewing, investment interest)
  *.tsx           # Shared components (Header, Footer, cards, etc.)
lib/
  format.ts       # Nigeria formatting helpers
  storage.ts      # Supabase storage URL helper
  supabase/       # Supabase client (server + client)
  types.ts        # TypeScript types for DB
  utils.ts        # cn() helper
supabase/
  migrations/     # SQL migrations
  seed.sql        # Seed data
```

## Open Items (client to supply)

- Real office address & phone/WhatsApp numbers
- Social media links
- Final domain name
- Real listing data (photos + details)
- Agent photos and bios
- Firm story copy edits
- Real investment opportunities + ROI wording
- Partner company names/logos/links
- Legal review of investment disclaimer text