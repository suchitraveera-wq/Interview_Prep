# AI PM Interview Prep — Progress Log

Chronological record of work done, decisions made, and what's left. See
`product-spec.md` for requirements and `technical-spec.md` for
architecture detail.

---

## 2026-08-14 — Spec + scaffold

**Done:**
- Wrote `product-spec.md` covering both pages, data source, local-storage
  behavior, and open items.
- Scaffolded the full Next.js 15 + TypeScript + Tailwind project under
  `interview-prep-app/`.
- Built the Practice page: random question draw, category filtering,
  elapsed timer (with persisted show/hide toggle), practiced-question
  tracking via localStorage, progress counter, and the Submit-a-Question
  CTA.
- Built the Resources page: companies-hiring grid + topic-grouped
  resources, reading from `data/resources.json`.
- Wrote `scripts/sync-questions.js` to pull the Google Sheet's CSV export
  into `data/questions.json` at build/sync time (not live client fetch).
- Seeded `data/questions.json` with 18 real rows from the source sheet so
  the app isn't empty on first run.
- Verified `npm run build` compiles cleanly and both routes prerender as
  static pages (fonts temporarily swapped to system fonts to isolate a
  sandbox network restriction, then reverted — see technical-spec.md §6).
- Caught and fixed a security issue during scaffolding: initial
  `next@14.2.5` had known high-severity CVEs; upgraded to `next@^15.5.0`
  and bumped `postcss` to clear all but 3 findings that live inside Next's
  own bundled dependencies (see technical-spec.md §5).

**Status:** Initial scaffold complete and build-verified. Not yet run in a
live dev server with real network access, and not yet deployed anywhere.

**Next up (not started):**
- Real content for `data/resources.json` (currently placeholder entries).
- Decide and wire up a sync schedule for `sync-questions.js` (manual vs.
  CI job).
- Confirm the Google Sheet is set to "Publish to web" as CSV so the sync
  script works without auth.
- Address question-ID stability (see technical-spec.md §4) if/when the
  sheet's rows are likely to be reordered or deleted.
- Deploy target not yet chosen (Vercel is the natural fit for Next.js, but
  not decided).

---

## How to use this log

Add a dated entry each time meaningful work happens — what changed, any
decisions made and why, and what's still open. Keep completed items and
open items in the same entry so status is visible without cross-referencing
old entries.
