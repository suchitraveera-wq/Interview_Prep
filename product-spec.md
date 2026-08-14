# AI PM Interview Prep — Product Spec

## 1. Overview

**Goal:** Help product managers practice for AI PM interviews by surfacing real, crowdsourced interview questions and a curated list of resources to study from.

**Users:** PMs actively interviewing (or preparing to interview) for AI-focused product roles.

**Platform:** Responsive web app — must work well on both desktop and mobile.

**Tech stack:** React (Next.js), deployed as a static/hybrid site.

---

## 2. Information Architecture

Two pages, linked via a shared nav/header:

1. **Practice** (`/`) — the interview question practice tool
2. **Resources** (`/resources`) — curated hiring list + topic resources

---

## 3. Data Source: Interview Questions

**Source:** [AI PM Interview Questions Google Sheet](https://docs.google.com/spreadsheets/d/1tNUIgrWR_e9BOLioJmAxqvi-BOIV6C8X4UfF8zWDUWk/edit?usp=sharing)

**Sheet columns (as of spec writing):**
| Column | Field | Notes |
|---|---|---|
| A | Timestamp | Form submission time — not shown in UI |
| B | Company Name | Displayed with the question |
| C | Interview Question | Main question text |
| D | Question Type | Used as the "category" (e.g. General, AI Product Sense, AI Technical, Analytics) |
| E | Comments | Optional follow-up/prep notes — show if present |

**Sync approach (recommended): build-time export, not live client-side fetch.**

- **Why:** Live client-side fetching from Google Sheets requires either exposing an API key in the browser or relying on the sheet's public CSV export endpoint, which is fragile (breaks if sharing settings change, subject to rate limiting, adds load-time latency and a hard runtime dependency on Google's availability).
- **How it works:**
  1. A small Node script (`scripts/sync-questions.js`) fetches the sheet's published CSV export URL and converts it to `data/questions.json`.
  2. This runs manually (`npm run sync-questions`) or on a schedule (e.g. GitHub Action, daily/weekly) — **not** on every user page load.
  3. The Next.js app reads from the committed/generated `data/questions.json` at build time.
- **Trade-off to flag:** New submissions to the Google Form won't appear instantly — there's a sync lag (minutes to a day, depending on how often the sync runs). This is acceptable for an interview-practice tool where question freshness isn't second-to-second critical.
- **Open item:** Decide sync cadence (manual trigger vs. scheduled CI job) once the site is live — noted here as a follow-up, not blocking initial build.

**Data shape (`data/questions.json`):**
```json
[
  {
    "id": "q-002",
    "company": "Brex",
    "question": "How do you use AI tools in your work as a PM?",
    "category": "General",
    "comments": "Talk about jobs to be done for a PM, then which tool fits each stage."
  }
]
```
- `id`: stable identifier generated at sync time (e.g. row-based) so local-storage "practiced" tracking survives re-syncs as long as row order doesn't change. Flag for future improvement: switch to a hash of company+question text for a truly stable ID.

---

## 4. Page 1: Practice Page

### 4.1 Question Display
- On load, show **one randomly selected question** from `questions.json`.
- Display: **Company name**, **question text**, **category** (as a visible tag/badge).
- If `comments` is present, show it in a collapsed/secondary "Prep notes" section (not front-and-center — it may contain answer hints, so it shouldn't spoil the practice).

### 4.2 Next Question
- Prominent **"Next Question"** button.
- Picks a new random question from the (filtered, if a category filter is active) pool.
- Avoid immediately repeating the same question twice in a row where the pool size allows it.

### 4.3 Category Filtering
- Filter control (dropdown or pill/tag buttons) listing all distinct `category` values present in the data.
- Selecting a category restricts the random pool to that category; "All" resets it.
- Filter state does not need to persist across sessions (open item — see §7).

### 4.4 Practiced-Question Tracking (local storage)
- When a user views a question, mark it as "practiced" in `localStorage` (e.g. `{ practicedIds: ["q-002", "q-015"] }`).
- Show a small visual indicator (e.g. checkmark or "Practiced" badge) if the currently displayed question has been seen before.
- Include a lightweight way to see progress, e.g. "12 of 99 questions practiced" counter near the filter controls.
- No backend/account system — this is purely local to the browser/device.

### 4.5 Timer
- A timer starts automatically when a question is displayed (counts up, mm:ss).
- Resets when "Next Question" is clicked.
- **Toggle to show/hide** the timer (user preference) — persist this toggle choice in local storage so it doesn't reset every visit.

### 4.6 Submit a Question (User Contribution)
- Prominent **"Submit a Question"** button/link, opening the [Google Form](https://docs.google.com/forms/d/e/1FAIpQLSekX2c8CHa9LWY91kBVMg5lNCqkLUvQWJ9zyv8OZkaZ2UOB3Q/viewform) in a new tab.
- Short instructional copy near the button explaining this is a community-sourced question bank and contributions are welcome (exact copy TBD — placeholder in initial build).

---

## 5. Page 2: AI Resources Page

### 5.1 Top AI Companies Hiring
- Curated list: company name + link to their careers/jobs page.
- **Content status: placeholder for initial build.** Ship with a small illustrative set (e.g. 5–8 example entries covering companies already appearing in the question bank, like OpenAI, Anthropic, Google DeepMind, Meta, Microsoft) clearly structured so real data can be dropped in later without touching layout code.

### 5.2 Topic-Based Resources
- Grouped by concept — initial groupings based on categories/topics seen in the question data and common AI PM study areas:
  - MCP (Model Context Protocol)
  - RAG (Retrieval-Augmented Generation)
  - Fine-tuning
  - AI Ethics & Responsible AI
  - Evals & AI Product Metrics
- Each resource entry includes: **title**, **brief description** (1–2 sentences), **link**.
- **Content status: placeholder for initial build** — same reasoning as above, structured as data (not hardcoded markup) so it's a content edit, not a code change, to fill in real resources later.

### 5.3 Data shape (`data/resources.json`)
```json
{
  "companies": [
    { "name": "Anthropic", "url": "https://www.anthropic.com/careers" }
  ],
  "topics": [
    {
      "topic": "RAG",
      "resources": [
        {
          "title": "Example resource title",
          "description": "One to two sentence description of what this covers.",
          "url": "https://example.com"
        }
      ]
    }
  ]
}
```

---

## 6. Responsive Design

- Single-column, touch-friendly layout on mobile (question card, filter, timer, buttons stacked).
- Desktop can use a wider card layout with filter controls alongside the question rather than stacked above it.
- Nav between Practice/Resources pages must be reachable on mobile (e.g. simple top nav bar, no hamburger menu needed for just 2 pages).

---

## 7. Open Items / Follow-Ups (not blocking initial build)

- Sync cadence for the Google Sheet → JSON pipeline (manual vs. scheduled CI).
- Whether filter selection and scroll position should persist across sessions.
- Real content for the Resources page (companies + topic resources) — currently placeholder.
- Exact copy/tone for the "Submit a Question" instructional text.
- Question `id` stability strategy if sheet rows get reordered/deleted (see §3).

---

## 8. Out of Scope (for this version)

- User accounts / login.
- Server-side storage of practiced questions (local storage only).
- Editing or moderating submitted questions from within the app (handled via the Google Form + sheet directly).
