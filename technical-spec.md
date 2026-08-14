# AI PM Interview Prep — Technical Spec

Companion to `product-spec.md` (the "what and why"). This document covers
the "how" — architecture, file structure, and implementation decisions made
while scaffolding the project.

---

## 1. Stack

| Layer | Choice | Notes |
|---|---|---|
| Framework | Next.js 15 (App Router) | Started on 14.2.5, upgraded to `^15.5.0` during scaffolding — 14.2.5 and the first patch bump (14.2.32) both still had open high-severity CVEs; Next 15 cleared those. |
| Language | TypeScript | `strict: true` |
| Styling | Tailwind CSS 3 | Design tokens defined in `tailwind.config.ts`, not hardcoded hex values in components |
| Fonts | `next/font/google` | Space Grotesk (display), Inter (body), IBM Plex Mono (timer/category/company metadata) |
| State | React `useState`/`useEffect`, no external state library | App is small enough (2 pages, local-only state) that Redux/Zustand/etc. would be overhead |
| Persistence | Browser `localStorage` only | No backend, no database — see product-spec.md §8 (Out of Scope) |
| Data | Static JSON files (`data/questions.json`, `data/resources.json`) | Read at build time, not fetched client-side |

---

## 2. Project Structure

```
interview-prep-app/
├── app/
│   ├── layout.tsx              Root layout: fonts, nav, global metadata
│   ├── globals.css              Tailwind directives + base styles + notch signature element
│   ├── page.tsx                  Practice page (route: /)
│   └── resources/
│       └── page.tsx               Resources page (route: /resources)
├── components/
│   ├── NavBar.tsx                 Practice/Resources nav, active-link styling
│   ├── QuestionCard.tsx            Question display — the "ticket stub" signature UI
│   ├── Timer.tsx                    Elapsed-time counter, show/hide toggle
│   ├── CategoryFilter.tsx           Category pill filter
│   └── ProgressCounter.tsx           "X of Y practiced" counter
├── lib/
│   ├── questions.ts                 Data types, category extraction, random-pick logic
│   └── storage.ts                    localStorage read/write helpers (SSR-safe)
├── data/
│   ├── questions.json                Question bank (seeded from sheet, refreshed via sync script)
│   └── resources.json                 Companies + topic resources (placeholder content)
├── scripts/
│   └── sync-questions.js              Node script: Sheet CSV export → questions.json
├── tailwind.config.ts                Design tokens (colors, fonts, radii)
├── next.config.js
├── tsconfig.json
├── postcss.config.js
├── .env.template
└── README.md
```

---

## 3. Data Flow

### Questions (Practice page)
1. **Build/sync time:** `npm run sync-questions` fetches the Google Sheet's
   published CSV export, parses it, and writes `data/questions.json`.
2. **Build time:** Next.js bundles `questions.json` into the app via a
   static `import` in `lib/questions.ts` (`resolveJsonModule` in
   `tsconfig.json` makes this type-safe).
3. **Runtime (client):** `app/page.tsx` is a client component (`"use client"`)
   because it needs `localStorage` and interactive state (timer, filter,
   current question). On mount, it picks an initial random question and
   hydrates practiced-question state from `localStorage`.
4. **No server round-trip** happens when a user clicks "Next Question" or
   changes the category filter — everything after initial page load runs
   against the in-memory `questions.json` data already shipped to the
   browser.

### Resources page
- Server component (no `"use client"` needed — no interactivity beyond
  standard links). Reads `data/resources.json` directly and renders at
  build time as static HTML.

### Local storage keys
| Key | Shape | Purpose |
|---|---|---|
| `aipm-prep:practicedIds` | `string[]` | Question IDs the user has viewed |
| `aipm-prep:timerVisible` | `"true" \| "false"` | Timer show/hide preference |

Both are namespaced with an `aipm-prep:` prefix to avoid collisions if this
app is ever embedded alongside other tools on the same origin.

---

## 4. Key Implementation Decisions

### Why a Node script instead of a Sheets API integration
`scripts/sync-questions.js` hits the sheet's public CSV export endpoint
rather than the Google Sheets API. This avoids needing an API key/service
account for a read-only, low-frequency sync — but it does require the sheet
to stay set to "Anyone with the link can view" or explicitly published to
the web. If that access ever changes, the sync script's fetch will fail
loudly (non-200 response) rather than silently returning stale data.

### Why question IDs are position-based (and the risk that comes with it)
`sync-questions.js` generates IDs like `q-002-brex` from row order at sync
time. This is simple but **not stable across sheet edits** — deleting or
reordering a row shifts every subsequent ID. Since `practicedIds` in
localStorage stores these IDs, a user's practice history can silently
"orphan" (point to IDs that no longer exist, or now point to a *different*
question) after a resync.
- **Flagged, not fixed, in this pass** — see product-spec.md §7.
- **Fix path when it matters:** switch `id` generation to a hash of
  `company + question` text, which is stable regardless of row position.

### Why the Practice page is a single client component rather than split further
Timer, filter, and question state are all tightly coupled (changing the
filter or clicking Next both need to reset the timer and update practiced
state together). Splitting them into separate client components with
prop-drilling or context would add indirection without a clear benefit at
this size. Revisit if the page grows more features.

### Why Tailwind over CSS Modules / styled-components
Fastest path to consistently applying the design token system (colors,
type scale) defined in `tailwind.config.ts` across many small components,
without a runtime CSS-in-JS cost.

---

## 5. Known Technical Debt / Follow-Ups

- **`npm audit`: 3 high-severity findings**, all inside Next.js's own
  bundled dependencies (`sharp`, nested `postcss` — used for Next's image
  optimization, which this app doesn't use). Only resolvable by upgrading
  to Next 16, which includes breaking API changes. Left on Next 15 for a
  stable first build; revisit before production deployment.
- **No automated sync schedule.** `sync-questions.js` runs manually today.
  A GitHub Action (or similar) on a schedule would keep the question bank
  fresh without a manual step — not yet wired up.
- **No tests.** Given the app's size (2 pages, no backend), manual QA was
  used for this initial scaffold. If the app grows, `lib/questions.ts`
  (random selection, filtering) is the highest-value place to add unit
  tests first, since it's pure logic with no DOM/localStorage dependency.
- **Font fetch requires network access at build time** (`next/font/google`
  downloads font files during `next build`). Not an issue in normal
  deployment environments, but worth knowing if building in a sandboxed/
  offline CI environment.

---

## 6. Build Verification

As of this scaffold, `npm run build` was run and confirmed:
- Clean TypeScript compilation (`strict: true`, no errors)
- Both routes (`/`, `/resources`) prerender successfully as static pages
- No console errors during the build step

Verified in a network-restricted sandbox by temporarily substituting system
fonts for the Google Fonts imports (to isolate a font-fetch network issue
from actual code issues), confirming a clean build, then restoring the real
`next/font/google` setup. Not yet verified with real Google Fonts network
access — expected to work normally in any standard dev/CI environment.
