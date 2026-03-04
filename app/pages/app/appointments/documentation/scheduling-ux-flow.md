# Scheduling Module — UX Flow (Google Calendar-like)

Updated: 2026-03-04

This UX flow covers the screens and interactions for a calendar scheduling module.

---

## 1. Navigation & Views

Primary views:
- Month
- Week
- Day
- Agenda (list)

Utilities:
- Mini calendar picker
- Calendar list (toggle visibility)
- Search box
- Timezone selector (optional)

---

## 2. Month View

Layout:
- Grid with day cells
- Event chips (limit lines + “+N more”)
- Quick add on day click

Interactions:
- Click day → opens day drawer
- Drag event to move to another day (if time remains same)
- Hover/press event → preview card

---

## 3. Week View (core)

Layout:
- Time grid 00:00–24:00
- Columns by day
- All-day row on top

Interactions:
- Click + drag to create event (select time range)
- Drag event to move time/day
- Resize event duration
- Conflict highlight (optional)

---

## 4. Day View

Like Week but single column.
Best for mobile and heavy scheduling.

---

## 5. Agenda View

List grouped by day:
- time range
- title
- location
- calendar color

Supports infinite scroll (range-based fetching).

---

## 6. Create/Edit Event Modal

Fields:
- Title
- Start date/time
- End date/time
- All-day toggle
- Timezone (defaults to user TZ)
- Calendar selector
- Location
- Description
- Recurrence (None / Daily / Weekly / Monthly / Custom RRULE)
- Attendees (optional)
- Reminders

Primary actions:
- Save
- Delete / Archive

---

## 7. Recurrence Editing (series logic)

When editing a recurring event, prompt:
- This event only
- This and following
- All events (entire series)

For canceling:
- “Remove this occurrence”

For moving one occurrence:
- Create a modified exception automatically

---

## 8. Attendees & RSVP (optional)

Invite:
- Add by email
- Add internal users (autocomplete)

RSVP states shown as chips:
- Accepted / Tentative / Declined / Needs action

Sending:
- On save, show “Send invitations?” (optional in MVP)
- If always on, send automatically

---

## 9. Free/Busy Scheduling Helper

Create event flow enhancement:
- “Find a time” button
- Shows participant availability in a side panel:
  - busy blocks
  - suggested free slots

MVP alternative:
- Simple conflict warning: “You already have an event at this time.”

---

## 10. Search

Search bar scope:
- current calendar(s)
- optional time range (this month / all)

Results:
- list with highlight matches
- click jumps to event in view

---

## 11. Notifications / Reminders UX

Per-event reminder:
- 10 minutes before (default)
- add another reminder

History:
- “Notifications sent” (admin/debug optional)

---

## 12. MVP Screens Checklist

- [ ] Calendars list + toggle visibility
- [ ] Month view
- [ ] Week view
- [ ] Agenda view
- [ ] Create/Edit event modal
- [ ] Basic recurrence
- [ ] Cancel occurrence
- [ ] Basic search
- [ ] Reminders (in-app)

---

## 13. Nice-to-have (post-MVP)

- Keyboard shortcuts (N = new event)
- Natural language input (“Tomorrow 3pm meeting”)
- Drag-to-duplicate (Alt+drag)
- Public sharing links
- Shared calendars with permissions UI
