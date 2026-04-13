# BLF - Brigade Lakefront Community Classes

## What is this?

A Progressive Web App for residents of Brigade Lakefront (BLF) apartment complex to discover, share, and manage community classes (dance, music, art, sports, academics, wellness). Replaces scattered Telegram group communication with a structured, searchable directory.

## Tech Stack

- **Next.js 15** (App Router, Turbopack) — frontend + API routes + Server Actions
- **Supabase** (Postgres, free tier) — database only, no Supabase Auth
- **Tailwind CSS v4** — CSS-based config via `@theme` in `globals.css`
- **bcryptjs** — PIN hashing
- **jose** — JWT signing/verification (edge-compatible)
- **Deployment target**: Vercel free tier

## Architecture

### Auth

Custom apartment + PIN authentication. No Supabase Auth — we use Supabase as a database only.

- Multiple profiles per apartment (e.g., husband and wife at M051)
- PIN hashed with bcrypt, JWT stored in httpOnly cookie (30-day expiry)
- JWT payload: `{ sub: residentId, apt: apartment, adm: isAdmin }`
- Rate limiting: 5 failed PIN attempts per 15 min per apartment (in-memory Map)
- Middleware (`middleware.ts`) protects all routes except `/`, `/api/auth/*`, static assets
- Admin role stored as `is_admin` boolean on residents table

### Data Access Pattern

- **Reads**: Server Components query Supabase directly via server client (`lib/supabase/server.ts`)
- **Writes**: Server Actions in `lib/classes/actions.ts` and `lib/auth/actions.ts`
- **Auth routes**: Route Handlers at `app/api/auth/*` (need cookie manipulation)
- **Admin actions**: Server Actions in `lib/admin/actions.ts` with `requireAdmin()` guard
- All DB access uses the Supabase service role key (server-side only, no RLS)

### Key Patterns

- `getSession()` in `lib/auth/session.ts` — reads JWT from cookies, returns `{ residentId, apartment, isAdmin }` or null
- Next.js 15: `cookies()` and route params are async (`await cookies()`, `await params`)
- Optimistic UI on InterestButton and VerifyButton via `useOptimistic`
- URL search params for class filtering (category, day, search)

## Database Schema (Supabase Postgres)

### Tables

- **residents** — `id`, `apartment`, `pin_hash`, `display_name` (required), `is_admin`, `created_at`, `updated_at`. Unique on `(apartment, display_name)`.
- **classes** — `id`, `created_by` (FK residents), `title`, `description`, `category`, `day_of_week` (text array), `time_slot`, `age_group`, `location`, `tutor_name`, `tutor_contact`, `fee`, `max_students`, `is_active`, timestamps.
- **registrations** — `id`, `class_id`, `resident_id`, `created_at`. Unique on `(class_id, resident_id)`.
- **class_verifications** — `id`, `class_id`, `resident_id`, `created_at`. Unique on `(class_id, resident_id)`.
- **class_reports** — `id`, `class_id`, `resident_id`, `reason`, `details`, `resolved` (bool), `created_at`. Unique on `(class_id, resident_id)`.

### Migration files

Run in this order for a fresh setup:
1. `supabase-schema.sql` — base tables
2. `supabase-migration-multi-profile.sql` — multi-profile per apartment
3. `supabase-migration-admin.sql` — admin column
4. `supabase-migration-verify-report.sql` — verify + report tables

## Project Structure

```
app/
  page.tsx                          — Login/Register (public)
  layout.tsx                        — Root layout, PWA meta tags
  globals.css                       — Tailwind v4 theme
  manifest.ts                       — PWA manifest
  api/auth/{check,register,login,logout,me}/route.ts
  (protected)/
    layout.tsx                      — App shell with BottomNav
    classes/page.tsx                — Browse classes (search + filter)
    classes/new/page.tsx            — Add class (two-step form)
    classes/[id]/page.tsx           — Class detail + verify/report
    classes/[id]/edit/page.tsx      — Edit class (owner only)
    my/page.tsx                     — My created + registered classes
    profile/page.tsx                — Name, PIN change, household reset, admin link
    admin/page.tsx                  — Reports tab + PIN reset tab (admin only)

components/
  auth/AuthForm.tsx                 — Multi-step: apartment → profile picker → PIN/register
  auth/PinInput.tsx                 — 4-digit PIN input with auto-focus
  classes/ClassCard.tsx             — Card with badges (verified, interested, reported)
  classes/ClassForm.tsx             — Two-step: required fields → optional fields
  classes/FilterBar.tsx             — Scrollable category + day chips with chevron indicators
  classes/SearchInput.tsx           — Debounced search via URL params
  classes/InterestButton.tsx        — Toggle with optimistic UI
  classes/VerifyButton.tsx          — Toggle with optimistic UI
  classes/ReportButton.tsx          — Expandable form with reason selection
  layout/BottomNav.tsx              — 4 tabs: Browse, Add, My Classes, Profile
  layout/PageHeader.tsx             — Centered logo + title, back button, action slot
  layout/ServiceWorkerRegistrar.tsx — Registers /sw.js

lib/
  types.ts                          — Resident, Class, ClassWithMeta, Session, Category, ReportReason
  constants.ts                      — Categories, days, age groups, time options, category colors
  supabase/server.ts                — Supabase client factory (service role key)
  auth/session.ts                   — JWT create/read/cookie management
  auth/rate-limit.ts                — In-memory rate limiter
  auth/actions.ts                   — Server Actions: updateProfile, changePin, getHouseholdMembers, resetHouseholdPin
  classes/queries.ts                — getClasses, getClassById, getMyClasses (with verification/report counts)
  classes/actions.ts                — createClass, updateClass, toggleInterest, deleteClass, toggleVerification, submitReport
  admin/actions.ts                  — searchResidents, adminResetPin, getReportedClasses, resolveReport, adminDeleteClass

middleware.ts                       — Auth guard, JWT validation, public path allowlist
```

## Environment Variables

```
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co   # safe to expose
SUPABASE_SERVICE_ROLE_KEY=eyJ...                     # server-only
JWT_SECRET=<random-64-char-string>                   # for signing JWTs
```

## Commands

- `npm run dev` — start dev server (Turbopack)
- `npm run dev -- -H 0.0.0.0` — dev server accessible from phone on same Wi-Fi
- `npx next build` — production build + type check + lint
- `node scripts/generate-icons.js` — regenerate SVG PWA icons

## Important Notes

- Categories default to "other" if not selected (optional field in step 2 of form)
- Location is mandatory for class creation
- Time is a selectable range (From/To dropdowns, 30-min intervals, 5AM-10PM)
- Class creators cannot verify/report their own classes
- Household members can reset each other's PINs from Profile page
- Admin access: set `is_admin = true` in the residents table; admin link appears on Profile page
- The apartment name is "Brigade Lakefront" (not "Bridge") — abbreviated as "BLF"
- Logo at `public/icons/logo.webp` sourced from MyGate
