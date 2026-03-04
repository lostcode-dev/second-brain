# Journal Module — UX Flow (Diário de Bordo + Métricas)

Updated: 2026-03-04

This UX flow covers screens and interactions to write daily entries and track metrics.

---

## 1. Navigation

Primary:
- Today
- Calendar
- Insights
- Search

Secondary:
- Metrics (manage)
- Prompts (optional)
- Export

---

## 2. Today Screen (core)

Layout:
- Date header + streak/consistency (optional)
- Editor card:
  - Title (optional)
  - Content editor (Markdown or rich text)
- Metrics panel (quick inputs):
  - sliders (mood, energy)
  - number fields (sleep hours)
  - toggles (exercise yes/no)
  - select chips (stress low/med/high)
- Tags input
- Save state (auto-save indicator)

Interactions:
- Auto-save every N seconds or on blur
- “Add prompt” dropdown (optional)
- Quick metric presets

Microcopy examples (PT-friendly):
- “Como foi o seu dia?”
- “O que você aprendeu hoje?”
- “Qual foi o momento mais importante?”

---

## 3. Calendar View

Month grid:
- Shows whether a day has an entry
- Optional mini badges:
  - mood color intensity (if enabled)
  - completion indicator

Click day:
- Opens entry detail drawer

---

## 4. Entry Detail Screen

Sections:
- Content
- Metrics snapshot
- Tags
- Edit button

Optional:
- “Compare with similar days” (future)
- Attachments gallery (V2)

---

## 5. Search Screen

Search bar + filters:
- Date range picker
- Tag filter
- Metric filters (e.g., mood >= 7)
- Full-text in content

Results list:
- Date + title
- Snippet highlight
- Key metrics summary (optional)

---

## 6. Insights Dashboard

Cards:
- Average mood (7d/30d)
- Sleep avg
- Energy avg
- Best day of week
- Trend arrows

Charts (simple):
- line chart per metric over time
- histogram for distribution (optional)

Correlation (V2):
- sleep vs mood scatter plot
- identify patterns (e.g., “mood higher when sleep > 7h”)

---

## 7. Metrics Management (Settings)

Metric list:
- Active / inactive toggles
- Edit min/max/step
- Reorder metrics shown on Today screen

Create metric flow:
- Name + key
- Type selection
- Range/options
- Unit

---

## 8. Prompts (optional)

Prompt templates:
- Morning check-in
- Evening reflection
- Gratitude
- Therapy-style prompts

UI:
- “Insert prompt” button
- Shows a list of prompts to answer

---

## 9. MVP Screens Checklist

- [ ] Today editor
- [ ] Metrics quick panel
- [ ] Calendar view
- [ ] Entry detail
- [ ] Search (basic)
- [ ] Insights (basic averages)
- [ ] Metrics catalog (predefined)

---

## 10. Nice-to-have (post-MVP)

- Autosave with version history
- Attachments
- Export (CSV/PDF)
- AI summary and weekly reflection
- Encryption options for private journals
