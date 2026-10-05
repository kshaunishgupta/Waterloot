# Waterloot

A campus-exclusive peer-to-peer marketplace for University of Waterloo students. Buy and sell textbooks, furniture, housing, electronics, and more with people you actually share a campus with.

**Live at [waterloot.ca](https://waterloot.ca)**

---

## The Problem

Facebook Marketplace works everywhere—which is the problem. You're selling to strangers with no shared identity. Trust is earned through reviews, but that takes time and creates friction.

Waterloot solves this with a simple constraint: **every user is a verified Waterloo student** (`@uwaterloo.ca` email required). No trust deficit. No reputation system overhead. Just students buying and selling to students.

---

## What You Can Do

- **Browse by category**: textbooks, furniture, electronics, housing/sublets, and more
- **List items easily**: ISBN auto-lookup for textbooks (Open Library API)
- **Find what you want**: search, filter, save listings
- **Connect safely**: seller emails only visible to signed-in users
- **Rate sellers**: simple like/dislike system
- **Post wanted ads**: looking for something? Post a budget and let sellers find you
- **Report problems**: spam, scams, or inappropriate content—report it and admins handle it

---

## How It Works

```
┌─────────────────────────────────────┐
│       Frontend (Next.js 15)         │
│  - Drag-and-drop image upload      │
│  - Real-time search & filters      │
│  - Saved listings & wanted posts   │
└────────────┬────────────────────────┘
             │ Server Actions (Next.js)
┌────────────▼────────────────────────┐
│      Backend (Supabase)             │
│  - Auth: @uwaterloo.ca verification │
│  - RLS: trust at the database layer │
│  - Storage: 6 photos per listing    │
└─────────────────────────────────────┘
```

**Key architecture decisions:**
- **Postgres RLS policies**: Access control happens in the database, not the app layer. A user can only see/modify their own listings and profile.
- **Server actions**: All mutations run on the server. No sensitive logic in the browser.
- **Supabase Storage**: Images stored directly, not in the database.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 15 (App Router) |
| Frontend | React 19, Tailwind CSS, Lucide Icons |
| Backend | Supabase (Postgres + RLS + Storage) |
| Auth | Supabase Auth with `@uwaterloo.ca` email restriction |
| Email | Resend (transactional email for reports/notifications) |
| Deployment | Vercel |
| Validation | Zod (client & server) |
| Maps | Leaflet / React Leaflet |

---

## Project Structure

```
src/
├── app/
│   ├── (admin)/          # Admin dashboard: users, reports, moderation
│   ├── (auth)/           # Sign up, login, password reset
│   ├── (protected)/      # Pages that require sign-in (create listing, saved items)
│   ├── (public)/         # Browse & search (no sign-in required)
│   └── api/              # Route handlers (ISBN lookup, report email webhook)
│
├── actions/              # Server actions (9 files, 33 functions)
│   ├── admin.ts          # Ban/unban users, promote to admin, remove listings
│   ├── listings.ts       # Create, edit, delete listings
│   ├── ratings.ts        # Like/dislike sellers
│   ├── reports.ts        # Report listings/users
│   ├── wanted.ts         # Create & manage wanted posts
│   ├── saved.ts          # Bookmark listings
│   ├── contact.ts        # Contact seller
│   ├── auth.ts           # Sign up, password reset
│   └── profile.ts        # Update profile, upload avatar
│
├── components/
│   ├── listings/         # Card, detail view, filter sidebar
│   ├── wanted/           # Wanted post cards & filters
│   ├── auth/             # Forms (login, signup, reset)
│   ├── ui/               # Shared primitives (Button, Input, Modal, Badge)
│   └── layout/           # Navbar, footer
│
├── lib/
│   ├── supabase/         # Browser, server, and admin clients
│   ├── validators/       # Zod schemas for all data
│   ├── types/            # TypeScript interfaces
│   ├── constants.ts      # Categories, sort options, report reasons
│   └── utils.ts          # Helpers (formatting, filtering)
│
└── supabase/
    ├── migrations/       # Ordered SQL migrations
    └── seed.sql          # Category seed data
```

---

## Getting Started

### Prerequisites
- Node.js 20+
- A Supabase account (free tier works)
- A Resend account (for report notifications, optional for local dev)

### 1. Clone & Install

```bash
git clone https://github.com/kshaunishgupta/waterloot.git
cd waterloot
npm install
```

### 2. Set up environment

Create `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
NEXT_PUBLIC_SITE_URL=http://localhost:3000

RESEND_API_KEY=your_resend_key  # Optional: for report emails
EMAIL_FROM=noreply@waterloot.ca
SEND_EMAIL_HOOK_SECRET=your_secret
```

### 3. Set up the database

```bash
# Install Supabase CLI if you haven't
npm install -g supabase

# Push migrations
supabase db push

# Seed categories
supabase db seed
```

### 4. Run locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Sign up with any `@uwaterloo.ca` email (verification is mocked in local dev).

---

## Key Features (Technical Details)

**Campus-only auth**
- Only `@uwaterloo.ca` emails can sign up
- Verified via Supabase Auth + custom email hook (Resend)
- Ban system: admins can ban users, which blocks them in Supabase Auth (`ban_duration: "876000h"`)

**Admin dashboard**
- View all users, listings, reports
- Ban/unban users (blocks in auth layer)
- Promote users to admin
- Remove/restore listings
- Mark reports as resolved

**Seller ratings**
- Simple like/dislike system per seller
- Shows approval % on seller profile
- Helps future buyers make trust decisions

**Listings**
- Support for 15+ categories
- Up to 6 photos per listing (Supabase Storage)
- Condition tracking (like new, good, fair, poor)
- Search & multi-filter (category, price range, condition)
- ISBN auto-lookup for textbooks (Open Library API)

**Wanted posts**
- Post what you're looking for + budget
- Sellers can reach out directly
- Saves as a bookmark so sellers don't lose it

---

## Deployment

**Vercel** (current)
```bash
vercel deploy
```

The site is deployed at [waterloot.ca](https://waterloot.ca).

**Custom deployment**
- App runs on Node 20+
- Requires environment variables (Supabase keys, Resend key)
- Database must be Supabase (or Postgres with RLS)

---

## Development

```bash
npm run dev              # Start dev server
npm run build            # Production build
npm run lint             # ESLint
npm run supabase:types  # Regenerate Supabase TypeScript types
```

---

## What's Next

- [ ] Messaging system (direct chat between buyers/sellers)
- [ ] Reviews (beyond just seller ratings)
- [ ] User verification (check UW student status via .pdf transcript)
- [ ] Categories for co-op housing (group listings)
- [ ] Mobile app (React Native)

---

## Questions?

Reach out at [waterloothelp@gmail.com](mailto:waterloothelp@gmail.com) or open an issue on GitHub.

If you're a UWaterloo student, [sign up and drop a listing](https://waterloot.ca).
