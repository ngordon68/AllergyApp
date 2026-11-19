# Allergy Checker — v1 Spec

**Goal:** A single-user web app. I save my allergies, type a dish name, and immediately see a red alert if the dish likely contains one of my allergens, or a green "looks safe" if it doesn't. Each check is saved to a history list.

**Time budget:** 90 minutes. **Stack:** Vite + React (JavaScript) and the Supabase JS client. **Out of scope:** login, payments, multiple users, AI or ingredient APIs, editing history.

---

## Decisions from the interview

| Question | Answer |
|---|---|
| Who uses it | Just me: one person, one shared list, no accounts |
| What it stores | **My allergies** and **check history**, in **one** table (see below) |
| Main action | Type a dish and get an alert |

**One table, two kinds of row.** The spec allows one Supabase table, so allergies and history share a table called `entries`. A `kind` column tells them apart: `'allergy'` or `'check'`.

---

## How the check works (v1)

1. `src/dishes.js` holds a hard-coded lookup of about 25 common dishes and their ingredients, for example:
   `"pad thai": ["rice noodles", "peanuts", "egg", "fish sauce", "shrimp"]`.
2. Normalize the typed dish: lowercase and trim. If it matches a key in the lookup, use that dish's ingredients. If it doesn't, fall back to the words in the dish name itself, so "peanut butter cookie" still catches "peanut".
3. An allergy matches when any ingredient (or word) contains the allergen text, or the allergen contains it. A small synonym map (`dairy → milk, cheese, butter, cream`; `shellfish → shrimp, crab, lobster`; `gluten → wheat, flour, bread, noodles`; `nuts → peanut, almond, cashew, walnut`) catches common cases.
4. Result:
   - **Match:** a red banner saying "⚠️ Pad Thai may contain: peanuts, shellfish"
   - **No match, known dish:** a green banner saying "✅ No listed allergens found"
   - **No match, unknown dish:** a yellow banner saying "❓ Dish not in database; checked the name only"

> v1 is a convenience tool, not medical advice. A footer line says so.

---

## The one screen

```
┌──────────────────────────────────────────┐
│  Allergy Checker                         │
│                                          │
│  My allergies                            │
│  [ peanuts ✕ ] [ shellfish ✕ ] [ milk ✕ ]│
│  [ add allergy...        ] [Add]         │
│                                          │
│  Check a dish                            │
│  [ pad thai              ] [Check]       │
│  ┌────────────────────────────────────┐  │
│  │ ⚠️ Pad Thai may contain: peanuts,  │  │
│  │    shellfish                        │  │
│  └────────────────────────────────────┘  │
│                                          │
│  Recent checks                           │
│  ⚠️ pad thai — peanuts, shellfish  2m ago│
│  ✅ caesar salad                   5m ago│
│                                          │
│  Not medical advice. Always ask staff.   │
└──────────────────────────────────────────┘
```

Components, all in `App.jsx` or split if it's quicker: `AllergyList`, `DishChecker`, `ResultBanner`, `History`.

---

## Build phases

### Phase 1: Scaffold the app (~10 min)
`npm create vite@latest . -- --template react`, then `npm install`, then `npm install @supabase/supabase-js`.

- [ ] `npm run dev` serves the app at `http://localhost:5173`
- [ ] The default Vite page has been replaced with an "Allergy Checker" heading
- [ ] `@supabase/supabase-js` is listed in `package.json`
- [ ] `.env.local` exists and is git-ignored, with placeholders `VITE_SUPABASE_URL=` and `VITE_SUPABASE_ANON_KEY=`
- [ ] The project is a git repo with a first commit

### Phase 2: Core screen with fake data (~25 min)
Everything works in memory with `useState`, seeded with fake allergies (`peanuts`, `shellfish`) and two fake history rows.

- [ ] I can add an allergy and it appears as a chip; empty input and duplicates are ignored
- [ ] I can remove an allergy with ✕
- [ ] `src/dishes.js` holds at least 20 dishes plus the synonym map
- [ ] Typing "pad thai" and pressing Check (or Enter) shows a red banner listing peanuts and shellfish
- [ ] Typing "caesar salad" with only peanuts saved shows a green banner
- [ ] Typing an unknown dish such as "grandma's stew" shows the yellow "not in database" banner
- [ ] Each check adds a row to the top of Recent checks
- [ ] The layout works at phone width (about 375px)

### Phase 3: Read data from Supabase (~15 min)
Create the `entries` table (SQL below), add a few rows by hand in the Supabase dashboard, and create `src/supabaseClient.js`.

- [ ] The table exists, and RLS is enabled with an anon `select` policy
- [ ] Allergy chips load from `entries where kind = 'allergy'` on page load
- [ ] Recent checks load from `entries where kind = 'check'`, newest first, limit 20
- [ ] All fake seed data is removed from the code
- [ ] A loading state shows while data is fetched, and a visible error message appears if the fetch fails
- [ ] Rows still show after refreshing the page

### Phase 4: Write data to Supabase (~20 min)
- [ ] Adding an allergy inserts a `kind='allergy'` row, and it survives a refresh
- [ ] Removing an allergy deletes its row, and it stays gone after a refresh
- [ ] Every check inserts a `kind='check'` row with `name`, `matched_allergens` and `is_safe`
- [ ] Anon `insert` and `delete` RLS policies are added, and there is no update policy
- [ ] Adding the same allergy twice (any capitalization) is blocked by the unique index and shows a friendly message
- [ ] Changes made in the Supabase dashboard show up after a refresh

### Phase 5: Deploy (~10 min)
Deploy to Vercel, or Netlify, which works the same way.

- [ ] The repo is pushed to GitHub
- [ ] A Vercel project is created with framework preset Vite, build command `npm run build`, output `dist`
- [ ] `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are set in Vercel's environment variables
- [ ] The public URL loads, shows my saved allergies, and a check on it writes a history row
- [ ] It works on my phone

---

## Supabase table plan: `entries`

| Column | Type | Required? | Notes |
|---|---|---|---|
| `id` | `uuid` | ✅ required (auto) | Primary key, `default gen_random_uuid()` |
| `kind` | `text` | ✅ required | `'allergy'` or `'check'` (check constraint) |
| `name` | `text` | ✅ required | Allergen name (`peanuts`) or dish typed (`pad thai`), stored lowercase |
| `matched_allergens` | `text[]` | ❌ optional | Only for `check` rows, e.g. `{peanuts,shellfish}`. Null for allergies |
| `is_safe` | `boolean` | ❌ optional | Only for `check` rows. `true` means no matches. Null for allergies |
| `created_at` | `timestamptz` | ✅ required (auto) | `default now()`, used to sort history |

```sql
create table public.entries (
  id                uuid primary key default gen_random_uuid(),
  kind              text not null check (kind in ('allergy', 'check')),
  name              text not null check (length(trim(name)) > 0),
  matched_allergens text[],
  is_safe           boolean,
  created_at        timestamptz not null default now()
);

-- No duplicate allergies (case-insensitive); checks can repeat
create unique index entries_unique_allergy
  on public.entries (lower(name)) where kind = 'allergy';

alter table public.entries enable row level security;

-- Phase 3
create policy "anon read"   on public.entries for select to anon using (true);
-- Phase 4
create policy "anon insert" on public.entries for insert to anon with check (true);
create policy "anon delete" on public.entries for delete to anon using (true);
```

> ⚠️ **No login means the data is public.** Anyone with the deployed URL can read, add or delete rows. That's fine for a single-user demo. Don't store anything sensitive, and add auth before sharing it widely.

---

## Later (not v1)
- Look up dish ingredients with an API or Claude instead of the hard-coded list
- Profiles for several people in a household
- Severity levels (intolerance vs. anaphylaxis)
- Login and per-user data
