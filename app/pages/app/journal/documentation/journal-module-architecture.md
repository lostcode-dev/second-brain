# Journal Module — Architecture

Updated: 2026-03-04

This document defines a scalable architecture for a Journal (Diário de Bordo) module with daily metrics.

---

## 1. Architecture Style

Recommended:
- **Clean Architecture** (UI / Application / Domain / Infrastructure)
- Optional event-driven analytics for insights
- Strong focus on **local date** and privacy

---

## 2. Bounded Contexts

### 2.1 Entries
- Entry CRUD
- Autosave / drafts
- Tagging

### 2.2 Metrics
- Metric definitions (catalog)
- Daily metric values (snapshots)
- Validation rules (range, units)

### 2.3 Insights
- Aggregations (weekly/monthly averages)
- Trend lines
- Correlations (optional)

### 2.4 Search
- Full-text search over content
- Filters by date/tags/metric ranges

### 2.5 Export (optional)
- CSV/JSON export
- PDF printable view

---

## 3. Domain Model

Entities:
- JournalEntry
- EntryTag
- MetricDefinition
- MetricValue (daily)
- PromptTemplate (optional)

Value Objects:
- LocalDate (timezone-safe)
- MetricType (number/scale/boolean/select/text)
- MetricRange (min/max)
- Unit (hours, minutes, score, etc.)

---

## 4. Key Use-Cases (Application Layer)

### Commands
- UpsertEntry (create/update by date)
- UpdateEntryContent
- AddTag / RemoveTag
- UpsertMetricDefinition (for custom metrics)
- UpsertDailyMetricValues
- ArchiveEntry (rare; usually keep history)
- ExportEntries (range)

### Queries
- GetTodayEntry
- GetEntryByDate
- ListEntries (range, tags, search)
- GetMetricsForRange
- GetInsightsDashboard

---

## 5. Policies & Invariants

- One entry per user per local date (recommended for simplicity).
- Metrics are keyed by (userId, date, metricDefinitionId).
- Validate metric values:
  - numeric within min/max
  - scale within allowed steps
  - select must match allowed options
- Do not compute “today” by server time; always use user timezone.

---

## 6. Privacy & Security

- Row-level security (RLS) for all journal tables
- Encryption for sensitive fields (optional)
- Explicit export actions (user-initiated)
- Audit log optional (for enterprise/workspaces)

---

## 7. Suggested Folder Structure

### Backend
- `src/modules/journal/domain`
- `src/modules/journal/application`
- `src/modules/journal/infrastructure`
- `src/modules/journal/http`

### Frontend
- `src/modules/journal`
  - `components/`
  - `views/` (Today, Calendar, Entry, Insights)
  - `hooks/`
  - `services/`
  - `types/`
  - `utils/`

---

## 8. MVP Checklist

- [ ] Today entry (create/edit)
- [ ] Calendar / timeline list
- [ ] Daily metrics (predefined set)
- [ ] Search by content
- [ ] Basic insights (weekly avg)
