# Waterloot

A campus-exclusive peer-to-peer marketplace for University of Waterloo students. Built with Next.js, Supabase, and Tailwind CSS so students can buy and sell textbooks, furniture, sublets, and more with people they actually share a campus with.

**Live:** [waterloot.ca](https://waterloot.ca)

---

## What is it?

Waterloot requires a valid `@uwaterloo.ca` email to sign up. That one constraint replaces the trust problem that makes platforms like Facebook Marketplace feel like a gamble. Every user is a verified Waterloo student, full stop.

**First week:** 50+ active users and around 20 live listings.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 15 (App Router) |
| Frontend | React 19, Tailwind CSS, Lucide Icons |
| Backend / DB | Supabase (Postgres + RLS + Storage) |
| Auth | Supabase Auth with @uwaterloo.ca email restriction |
| Transactional Email | Resend |
| Deployment | Vercel |
| Validation | Zod |
| Maps | Leaflet / React Leaflet |

---

## Features

**Campus auth** — signup is locked to @uwaterloo.ca emails. Verification is handled through Supabase Auth with a custom email hook built on Resend.

**Listings marketplace** — create, browse, filter, and search across categories like textbooks, electronics, furniture, housing, and more.

**Textbook fields** — ISBN lookup via the Open Library API auto-fills the title, author, and edition so sellers don't have to type everything out.

**Wanted posts** — post what you're looking for with an optional budget range. Other students can reach out to you directly.

**Saved listings** — bookmark anything you're interested in and find it later.

**Seller ratings** — a simple like/dislike system that shows an approval percentage on each seller profile.

**Reporting** — report a listing or user from any page. Admins get an email notification and can handle it from the dashboard.

**Admin dashboard** — ban/unban users, promote to admin, remove or restore listings, and resolve reports.

**Image uploads** — up to 6 photos per listing, stored in Supabase Storage.

**Contact flow** — seller emails are only visible to signed-in users. A modal lets buyers open Outlook directly or copy the address.

**Grid and list views** — toggle between a photo grid and a compact list on both the browse and wanted pages.

---

## Getting Started

### Prerequisites

Node.js 20 or higher, a Supabase project, and a Resend account for transactional email.

### 1. Clone and install

```bash
git clone https://github.com/your-repo/waterloot.git
cd waterloot
npm install
```

### 2. Set up environment variables

Create a `.env.local` file in the project root:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
NEXT_PUBLIC_SITE_URL=http://localhost:3000

# Optional but needed for transactional email and report notifications
RESEND_API_KEY=your_resend_api_key
EMAIL_FROM=noreply@yourdomain.com
SEND_EMAIL_HOOK_SECRET=your_hook_secret
```

### 3. Set up the database

Run the migrations in order from `supabase/migrations/`. If you have the Supabase CLI:

```bash
supabase db push
supabase db seed
```

### 4. Configure Supabase Auth

In your Supabase dashboard, set the Site URL and Redirect URLs to match `NEXT_PUBLIC_SITE_URL`.

To plug in the custom email hook, register a webhook in Supabase pointing to:

```
POST https://your-domain.com/api/auth/send-email
```

with `SEND_EMAIL_HOOK_SECRET` as the bearer token.

### 5. Run locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Project Structure

```
src/
├── app/                  # Next.js App Router pages
│   ├── (admin)/          # Admin dashboard — users, listings, reports
│   ├── (auth)/           # Login, signup, password reset flows
│   ├── (protected)/      # Pages that require a signed-in user
│   ├── (public)/         # Publicly browsable pages
│   └── api/              # Route handlers for ISBN lookup and the email hook
├── actions/              # Server actions for listings, auth, ratings, etc.
├── components/
│   ├── auth/             # Login, signup, and reset forms
│   ├── layout/           # Navbar and footer
│   ├── listings/         # Cards, forms, filters, and detail view
│   ├── profile/          # Profile header with avatar upload
│   ├── ratings/          # Seller like/dislike widget
│   ├── settings/         # Change password form
│   ├── ui/               # Shared primitives like Button, Input, Modal, Badge
│   └── wanted/           # Wanted post cards, filters, and contact button
├── hooks/                # useAuth and useDebounce
├── lib/
│   ├── constants.ts      # Conditions, sort options, report reasons, limits
│   ├── supabase/         # Browser, server, and admin Supabase clients
│   ├── types/            # TypeScript interfaces
│   ├── utils.ts          # cn, formatPrice, formatDate, formatCondition
│   └── validators/       # Zod schemas for auth, listings, wanted, profile
└── supabase/
    ├── migrations/       # Ordered SQL migration files
    └── seed.sql          # Category seed data
```

---

## Scripts

```bash
npm run dev             # Start the local dev server
npm run build           # Production build
npm run lint            # ESLint
npm run supabase:types  # Regenerate Supabase TypeScript types
```

---

## Questions or feedback?

Reach out at [waterloothelp@gmail.com](mailto:waterloothelp@gmail.com). If you're a UWaterloo student, come make an account and drop a listing.
