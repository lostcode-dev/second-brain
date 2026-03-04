# Scheduling Module — Architecture (Google Calendar-like)

Updated: 2026-03-04

This document defines a scalable architecture for a Scheduling/Calendar module.

---

## 1. Architecture Style

Recommended:
- **Clean Architecture** (UI / Application / Domain / Infrastructure)
- **Event-driven** for notifications and attendee invites
- Strong focus on **time zone** and **recurrence correctness**

---

## 2. Bounded Contexts

### 2.1 Calendars
- Calendar ownership, sharing, permissions
- Default calendars per user/workspace

### 2.2 Events
- Event CRUD
- Recurring series + exceptions
- Attachments, location, description

### 2.3 Availability
- Free/busy query
- Conflict detection (optional)

### 2.4 Notifications
- Reminders
- Invitation emails
- Change notifications

### 2.5 Search & Indexing
- Full-text search over title/description/location
- Time-based filtering

---

## 3. Domain Model

Entities:
- Calendar
- Event
- EventSeries (recurrence definition)
- EventOccurrence (virtual or materialized)
- EventException (modified/cancelled instance)
- Attendee
- Reminder
- FreeBusyBlock

Value Objects:
- DateTimeRange (start/end)
- TimeZone
- RRule (validated rule)
- RecurrenceId (occurrence identifier, usually start datetime in series TZ)

---

## 4. Key Use-Cases (Application Layer)

### Calendars
- CreateCalendar
- UpdateCalendar
- ArchiveCalendar
- ShareCalendar (grant permission)
- ListCalendars

### Events
- CreateEvent (single)
- CreateRecurringEvent (series)
- UpdateEvent:
  - single instance
  - series
  - this-and-following
- CancelOccurrence
- DeleteEvent/Series (archive recommended)
- MoveEvent (change calendar)
- DuplicateEvent

### Availability
- GetFreeBusy (calendars/users, time range)
- CheckConflicts (event draft)

### Notifications
- ScheduleReminders (job queue)
- SendInvites / SendUpdates

### Search
- SearchEvents (query + time filters)

---

## 5. Recurrence Strategy

Two approaches:

### A) Expand on read (recommended for MVP)
- Store RRULE and compute occurrences on the fly
- Persist only exceptions (modified/cancelled)
Pros:
- Simple storage
- Fewer writes
Cons:
- Must optimize expansion for long ranges

### B) Materialize occurrences
- Pre-generate occurrences into a table (e.g., next 12 months)
Pros:
- Fast reads
- Easier free/busy
Cons:
- Complex updates and backfills

Suggested hybrid:
- Expand on read for UI ranges (month/week)
- Materialize for free/busy + notifications window (next 30–90 days)

---

## 6. Time Zone Rules

- Store `start_at` and `end_at` as **timestamptz** in UTC.
- Also store `event_timezone` (IANA, e.g., `Europe/Lisbon`).
- Recurrence expansion must use the **event timezone**, not server timezone.
- UI rendering uses user-selected timezone (default user profile TZ).

---

## 7. Concurrency & Integrity

- Use optimistic concurrency (updated_at / version number).
- Enforce no invalid ranges (end > start).
- For “this-and-following”, split series:
  - original series gets an UNTIL before split point
  - new series starts at split point with new RRULE

---

## 8. Observability

- Log recurrence expansion performance (time, count)
- Audit changes for shared calendars (who changed what)
- Track notification sends and failures

---

## 9. Suggested Folder Structure

### Backend
- `src/modules/scheduling/domain`
- `src/modules/scheduling/application`
- `src/modules/scheduling/infrastructure`
- `src/modules/scheduling/http`

### Frontend
- `src/modules/calendar`
  - `components/`
  - `views/` (Month/Week/Day/Agenda)
  - `hooks/`
  - `services/`
  - `types/`
  - `utils/recurrence/`

---

## 10. MVP Checklist

- [ ] Calendar CRUD
- [ ] Event CRUD (single)
- [ ] Week/Month views
- [ ] Basic recurrence (daily/weekly/monthly)
- [ ] Cancel single occurrence
- [ ] Reminders (in-app)
- [ ] Search (title)
