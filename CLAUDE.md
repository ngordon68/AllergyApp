# CLAUDE.md

Allergy Checker: a single-user web app. Save your allergies, type a dish, and get an alert if it may contain one of them. The full plan is in `SPEC.md`.

## Stack
- Vite + React (JavaScript, no TypeScript)
- Supabase JS client (`@supabase/supabase-js`), with one table: `entries`
- Deployed on Vercel

## Commands
```bash
npm install          # install dependencies
npm run dev          # run locally at http://localhost:5173
npm run build        # production build into dist/
npm run preview      # serve the production build locally
```

## How to work
- **One phase at a time.** Build only the current phase of `SPEC.md`. Don't start the next one early.
- **Stop at the end of each phase.** Tell me exactly how to test it: the commands to run, what to click or type, and what I should see. Use that phase's acceptance checklist.
- **Don't commit until I confirm the phase works.**
- **Commit messages** use the form `Phase N: what changed`, for example `Phase 2: core screen with fake allergy data`.

## Secrets
- Never write API keys, URLs with keys, or other secrets into code or committed files.
- Read Supabase settings from `.env.local` via `import.meta.env.VITE_SUPABASE_URL` and `import.meta.env.VITE_SUPABASE_ANON_KEY`.
- `.env.local` must be listed in `.gitignore`. Check this before any commit.

## Dependencies
- The only packages allowed without asking are the ones Vite's React template installs, plus `@supabase/supabase-js`.
- Ask me before installing any other package.
