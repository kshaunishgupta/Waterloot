# Waterloot

A campus-exclusive peer-to-peer marketplace for University of Waterloo students. Buy and sell textbooks, furniture, housing, electronics, and more—with the trust that comes from knowing every seller is a verified UW student.

**Live at [waterloot.ca](https://waterloot.ca) • [Sign up](https://waterloot.ca/signup)**

---

## Why Waterloot?

Facebook Marketplace works everywhere—which is exactly the problem. You're buying from complete strangers. Trust is expensive: it requires reputation systems, reviews, and time.

Waterloot solves this with a single constraint: **every user must have an `@uwaterloo.ca` email**. That's it. No reputation needed. Every seller is a verified Waterloo student. Trust is the default.

---

## What Can You Do?

**Browse & Buy**
- Search across 15+ categories: textbooks, furniture, electronics, housing, and more
- Filter by price, condition, and category
- Save listings for later
- See seller ratings (approval %) at a glance

**Create & Sell**
- Post a listing in minutes (photo uploads, description, price)
- **For textbooks**: scan or enter an ISBN, and titles/authors auto-fill from Open Library
- Mark items as sold, or reactivate if they don't sell
- See your seller rating based on likes/dislikes from buyers

**Want Something?**
- Post a wanted ad ("looking for MATH 136 textbook, budget $50")
- Include your budget range
- Let sellers find you and reach out

**Stay Safe**
- Report spam, scams, or inappropriate content
- Admin team reviews and takes action (bans users if needed)
- Direct seller contact (emails hidden until you sign in)
- Simple seller ratings instead of complex review systems

---

## How It Works

```
Frontend (Next.js 15)          Server (Supabase)
┌──────────────────────┐      ┌──────────────────────┐
│ - Browse listings    │──RLS──│ Postgres database    │
│ - Create listings    │      │ - Profiles, listings │
│ - Rate sellers       │      │ - RLS policies (trust│
│ - Save listings      │      │   at DB layer)       │
│ - Post wanted ads    │      │ - 6 photos per list  │
│ - Report content     │      │                      │
└──────────────────────┘      └──────────────────────┘
```

**Key design decisions:**
- **RLS at the database layer**: Users can only see/modify their own data. This is enforced in Postgres, not the app.
- **Server actions**: All mutations happen on the server. No sensitive logic in the browser.
- **Campus-only auth**: Supabase Auth + custom email hook (Resend) ensures only `@uwaterloo.ca` emails can sign up.
- **Simple ratings**: Like/dislike per seller, not per transaction. Reduces complexity, still builds trust.

---

## For Users

**Just want to use Waterloot?**

Head to **[waterloot.ca](https://waterloot.ca)**, sign up with your `@uwaterloo.ca` email, and start buying and selling.

---

## For Developers

Want to understand the codebase, contribute, or deploy your own instance?

### What's Inside

**9,500+ lines of TypeScript/React**
- 33 server actions (auth, listings, ratings, reports, admin)
- 15+ React components (forms, cards, filters, modals)
- Full Supabase integration with RLS policies
- Email notifications via Resend
- Zod validation on client and server

**24 database migrations** covering:
- User profiles & authentication
- Listings (images, metadata, search)
- Seller ratings & reports
- Wanted posts
- Admin features
- Search function

### Prerequisites

- Node.js 20+
- A Supabase account ([free tier](https://supabase.com) works fine)
- A Resend account (free, for report notifications)
- An OpenAI API key (optional, for future features)

### 1. Clone & Install

```bash
git clone https://github.com/kshaunishgupta/Waterloot.git
cd Waterloot
npm install
```

### 2. Set up Supabase

```bash
# Install Supabase CLI
npm install -g supabase

# Link your Supabase project
supabase link --project-ref your_project_id

# Apply migrations
supabase db push

# Seed initial data (categories)
supabase db seed
```

Create `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
NEXT_PUBLIC_SITE_URL=http://localhost:3000

# Optional: for report notifications
RESEND_API_KEY=your_resend_key
EMAIL_FROM=noreply@waterloot.ca
SEND_EMAIL_HOOK_SECRET=your_secret
```

In Supabase dashboard:
1. Set Site URL to `http://localhost:3000`
2. Set Redirect URLs to `http://localhost:3000/auth/callback`
3. (Optional) Add a webhook to `/api/auth/send-email` for email verification

### 3. Run Locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

Sign up with any `@uwaterloo.ca` email (email verification is skipped in local dev).

### Project Structure

```
src/
├── app/
│   ├── (admin)/        # Admin dashboard: users, listings, reports
│   ├── (auth)/         # Sign up, login, password reset
│   ├── (protected)/    # Auth-only pages (create listing, saved, settings)
│   ├── (public)/       # Browse & search (no auth required)
│   └── api/            # Route handlers (ISBN lookup, webhooks)
│
├── actions/            # Server actions (mutations)
│   ├── admin.ts        # Ban users, remove content, promote admins
│   ├── listings.ts     # Create, edit, delete, mark sold
│   ├── ratings.ts      # Like/dislike sellers
│   ├── reports.ts      # Report listings/users
│   ├── wanted.ts       # Create/delete wanted posts
│   ├── saved.ts        # Save/unsave listings
│   ├── contact.ts      # Reveal seller email
│   ├── auth.ts         # Sign up, sign in, reset password
│   └── profile.ts      # Update profile, upload avatar
│
├── components/
│   ├── listings/       # Listing card, form, detail view, filters
│   ├── wanted/         # Wanted post cards, form, filters
│   ├── auth/           # Login, signup, reset forms
│   ├── ui/             # Button, Input, Modal, Badge, etc.
│   └── layout/         # Navbar, footer, sidebar
│
├── lib/
│   ├── supabase/       # Client (browser), server, and admin Supabase clients
│   ├── validators/     # Zod schemas (auth, listings, ratings, etc.)
│   ├── types/          # TypeScript interfaces from Supabase
│   ├── constants.ts    # Categories, sort options, report reasons, limits
│   └── utils.ts        # Helpers (formatting, filtering, validation)
│
└── supabase/
    ├── migrations/     # 24 SQL migrations (ordered 00001-00024)
    └── seed.sql        # Category seed data
```

### Key Features (Implementation Details)

**Campus-only access control**
- Signup requires `@uwaterloo.ca` email (enforced in Supabase Auth)
- Verification via custom email hook (Resend)
- Ban system: admins can ban users, which blocks them in Supabase Auth (876000 hour duration = ~100 years)

**Listings**
- Create, edit, delete, mark as sold, reactivate
- Up to 6 photos per listing (Supabase Storage)
- 15+ categories with subcategories (e.g., housing types)
- Textbook-specific flow with ISBN → auto-fill title/author
- Condition tracking (like new, good, fair, poor)
- Search and multi-filter (category, price range, condition)

**Wanted posts**
- Post what you're looking for + budget
- Sellers can see and reach out
- Mark as fulfilled when you find what you want

**Seller ratings**
- Buyers can like or dislike a seller after purchase
- Shows approval % on seller profile
- Simple system: no complex review text, just thumbs up/down

**Admin dashboard**
- View all users with ban status
- View and remove listings
- View and resolve user/listing reports
- Ban/unban users
- Promote students to admin
- Remove or restore wanted posts

**Reports**
- Report a listing or user for spam, scams, inappropriate content, etc.
- Admins get notified via email
- Admins can resolve and remove reported content

### Scripts

```bash
npm run dev              # Start dev server (hot reload)
npm run build            # Production build
npm run lint             # ESLint check
npm run supabase:types  # Regenerate TypeScript types from Supabase
```

### Deployment

**Current deployment**: Vercel

```bash
vercel deploy
```

Environment variables must be set in Vercel dashboard (same as `.env.local`).

**Other platforms**: The app runs on any Node 20+ environment with:
- Supabase backend
- Environment variables for Supabase keys and Resend key
- Vercel for automatic deployments (or any hosting that supports Next.js)

---

## Design Decisions

**Why no messaging system?**
We built a chat feature initially but removed it. Reason: most transactions (buying a textbook, renting furniture) don't need back-and-forth. Direct email is simpler and avoids lock-in to the platform.

**Why simple ratings instead of reviews?**
Reviews are expensive: they invite trolling, fake reviews, and moderation headaches. A simple like/dislike per seller is faster to leave, easier to trust, and less manipulable.

**Why no meetup location tracking?**
We built this too, but removed it. Reason: student-only marketplace + email contact is enough. Adding location complexity wasn't worth the UI overhead.

---

## What's Missing (Future Ideas)

- [ ] Direct messaging (if chat becomes important)
- [ ] User verification (upload transcript to confirm UW student)
- [ ] Group housing listings (flag listings as "group sublet")
- [ ] Price history & analytics
- [ ] Mobile app (React Native)
- [ ] Co-op housing board (dedicated section for work-term housing)

---

## Contributing

This is a student project. If you're a UW student and want to contribute:

1. Fork the repo
2. Create a branch for your feature
3. Open a PR
4. We'll review and merge if it fits the vision

---

## Questions?

- **Using Waterloot?** Email [waterloothelp@gmail.com](mailto:waterloothelp@gmail.com)
- **Contributing?** Open an issue or PR on GitHub
- **Found a bug?** Report it as an issue

---

## Stack

- **Frontend**: Next.js 15 (App Router), React 19, Tailwind CSS
- **Backend**: Supabase (Postgres + RLS)
- **Auth**: Supabase Auth
- **Email**: Resend
- **Validation**: Zod
- **Maps**: Leaflet (if using location features)
- **Deployment**: Vercel
- **Database**: PostgreSQL (Supabase managed)
