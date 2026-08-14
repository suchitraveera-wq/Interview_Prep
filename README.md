# AI PM Interview Prep

Practice tool for AI product manager interviews. Full requirements and
rationale live in `../Project Memory/product-spec.md`.

## Getting started

```bash
npm install
npm run dev
```

Visit http://localhost:3000.

## Syncing questions from the Google Sheet

`data/questions.json` is checked in and used at build time — the app does
not fetch the sheet live in the browser (see product-spec.md §3 for why).

To refresh it from the source sheet:

```bash
npm run sync-questions
```

This requires the sheet to be published to the web as CSV (File > Share >
Publish to web), since the script hits the public CSV export endpoint.

**Not yet wired up:** a scheduled job to run this automatically. Open item —
see product-spec.md §7.

## Project structure

```
app/
  page.tsx              Practice page
  resources/page.tsx    Resources page
  layout.tsx            Shared layout, fonts, nav
components/
  QuestionCard.tsx       Question display (signature "drill card" UI)
  Timer.tsx               Elapsed-time counter with show/hide toggle
  CategoryFilter.tsx      Category pill filter
  ProgressCounter.tsx     "X of Y practiced" counter
  NavBar.tsx               Practice / Resources nav
data/
  questions.json          Question bank (synced from the Google Sheet)
  resources.json           Companies hiring + topic resources (placeholder content)
lib/
  questions.ts             Random selection + filtering helpers
  storage.ts                localStorage helpers (practiced questions, timer visibility)
scripts/
  sync-questions.js        Pulls the Google Sheet CSV into data/questions.json
```

## Known open items

See product-spec.md §7 for the full list. Most relevant to development:

- Question `id`s are currently row-position-based — reordering sheet rows
  will shift IDs and can orphan a user's local "practiced" history.
- Resources page content is placeholder — swap `data/resources.json`.
