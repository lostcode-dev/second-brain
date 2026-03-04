# Journal Module — Overview (Diário de Bordo + Métricas)

Updated: 2026-03-04

This module provides a **daily journal (diário de bordo)** where users can:
- Write about their day (free text, structured prompts)
- Attach **daily metrics** (mood, energy, sleep, productivity, etc.)
- Track trends over time
- Search and filter entries
- Export data (optional, GDPR-friendly)

---

## Core Concepts

### Journal Entry
A daily record containing:
- Date (local date per user timezone)
- Content (rich text or markdown)
- Tags (optional)
- Attachments (optional)
- Metrics snapshot (one per day, or multiple metric values)

### Metrics
User-defined or predefined measurements captured per day:
- Numeric (0–10, 0–100, minutes, hours)
- Scale (1–5)
- Boolean (yes/no)
- Select (e.g., "low/medium/high")
- Text (short answer)

Examples:
- Mood (1–10)
- Energy (1–10)
- Sleep hours (0–24)
- Steps
- Productivity (1–5)
- Anxiety (1–10)
- Gratitude (text)
- Highlights (text)

---

## Primary User Flows

1. Open **Today**
2. Write journal text (optionally guided by prompts)
3. Fill daily metrics (quick sliders/toggles)
4. Save (auto-save optional)
5. View calendar/timeline of entries
6. Filter/search by tags, mood, date ranges
7. Insights dashboard (weekly/monthly trends)

---

## MVP Scope (recommended)

- Create/edit entry per day
- Basic editor (Markdown or simple rich text)
- Metric definitions (predefined set)
- Daily metric capture
- Calendar view + list view
- Search (title/content)
- Basic insights (averages and charts)

---

## V2 Scope

- Custom metrics (user-defined templates)
- Prompt library (morning/evening)
- Attachments (photos, files)
- Mood map / correlations (sleep vs mood)
- Export (CSV/JSON/PDF)

---

## V3 Scope

- AI reflection summaries
- Personalized prompts (based on patterns)
- Sharing (private link) / therapist export
- Encryption at rest (advanced)
