# Scheduling Module — Overview (Google Calendar-like)

Updated: 2026-03-04

This module provides calendar scheduling capabilities similar to Google Calendar:
- Multiple calendars per user/workspace
- Events with recurrence (RRULE)
- Attendees + RSVP (optional)
- Reminders/notifications
- Availability (free/busy)
- Time zone correctness
- Search + month/week/day views

---

## Core Concepts

### Calendar
A container for events (e.g., "Personal", "Work", "Team").
Calendars can be owned by a user, shared, or belong to a workspace.

### Event
A time-bounded item on a calendar. Can be:
- Single instance
- Recurring series (with exceptions)

### Recurrence (RRULE)
Recurring events are defined by a recurrence rule (RFC 5545 / iCalendar RRULE),
e.g., weekly on Mondays and Wednesdays, every 2 weeks, until a date, etc.

### Exceptions
A recurring series can have:
- **Modified occurrences** (a specific instance differs)
- **Cancelled occurrences** (skip a date)

### Attendees (optional)
Invite people, track responses:
- needsAction / accepted / tentative / declined

### Free/Busy
Availability query returns occupied time ranges for one or more calendars/users.

---

## Primary User Flows

1. Create calendar
2. Create event (single / recurring)
3. Invite attendees (optional) + send notifications
4. Edit event:
   - this event only
   - this and following
   - entire series
5. View month/week/day agenda
6. Search events
7. Check availability (free/busy)
8. Reminders + notifications

---

## MVP Scope (recommended)

- Calendars (create/list/update/delete/archive)
- Events (CRUD)
- Timezone-safe rendering
- Basic recurrence (daily/weekly/monthly + UNTIL/COUNT)
- Exceptions: cancel single occurrence
- Reminders (in-app/email push later)

---

## V2 Scope

- Full RFC5545 RRULE support (BYSETPOS, complex rules)
- Modified occurrences (override start/end/title)
- Shared calendars + permissions (read/write)
- Attendees + RSVP + email invites
- Free/busy across multiple calendars/users

---

## V3 Scope

- Conference links (Meet/Zoom integration)
- Resource booking (rooms)
- Smart scheduling suggestions
- Public share links
- Offline sync (mobile)
