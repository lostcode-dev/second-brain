# Scheduling Module — API Spec (Google Calendar-like)

Updated: 2026-03-04

REST-first API specification for calendar scheduling.
Base path: `/api/v1`

---

## 1. Auth
All endpoints require authentication:
- `Authorization: Bearer <token>`

---

## 2. Calendars

### POST `/calendars`
Create calendar.

Request:
```json
{
  "name": "Work",
  "description": "My work calendar",
  "visibility": "private"
}
```

Response: `201`.

### GET `/calendars`
List calendars (owned + shared).

### GET `/calendars/:id`
Get calendar details.

### PATCH `/calendars/:id`
Update calendar.

### POST `/calendars/:id/archive`
Archive calendar.

### POST `/calendars/:id/share`
Share calendar with another user.

Request:
```json
{
  "sharedWithUserId": "uuid",
  "canWrite": false
}
```

---

## 3. Events

### POST `/events`
Create event (single or recurring).

Request (single):
```json
{
  "calendarId": "uuid",
  "title": "Gym",
  "startAt": "2026-03-04T18:00:00Z",
  "endAt": "2026-03-04T19:00:00Z",
  "eventTimezone": "Europe/Lisbon",
  "allDay": false
}
```

Request (recurring series):
```json
{
  "calendarId": "uuid",
  "title": "Standup",
  "startAt": "2026-03-04T09:30:00Z",
  "endAt": "2026-03-04T10:00:00Z",
  "eventTimezone": "Europe/Lisbon",
  "rrule": "FREQ=WEEKLY;BYDAY=MO,TU,WE,TH,FR"
}
```

Response: `201` event.

### GET `/events`
List events in range.

Query params:
- `calendarId` (optional)
- `from` (ISO datetime)
- `to` (ISO datetime)
- `q` (search query)
- `includeRecurring=true|false`

### GET `/events/:id`
Get event details (includes attendees, reminders, recurrence).

### PATCH `/events/:id`
Update single event or series root fields (not instance-specific).

### POST `/events/:id/archive`
Archive event/series.

---

## 4. Recurring Event Instance Operations

### POST `/events/:id/occurrences/cancel`
Cancel one occurrence.

Request:
```json
{
  "recurrenceId": "2026-03-11T09:30:00+00:00"
}
```

### POST `/events/:id/occurrences/modify`
Modify one occurrence (creates exception record).

Request:
```json
{
  "recurrenceId": "2026-03-11T09:30:00+00:00",
  "override": {
    "title": "Standup (Delayed)",
    "startAt": "2026-03-11T10:00:00Z",
    "endAt": "2026-03-11T10:30:00Z"
  }
}
```

### POST `/events/:id/series/split`
Update “this and following” (splits series).

Request:
```json
{
  "splitFromRecurrenceId": "2026-03-11T09:30:00+00:00",
  "newSeries": {
    "title": "Standup (New Time)",
    "startAt": "2026-03-11T10:00:00Z",
    "endAt": "2026-03-11T10:30:00Z",
    "rrule": "FREQ=WEEKLY;BYDAY=MO,TU,WE,TH,FR"
  }
}
```

---

## 5. Attendees (optional)

### POST `/events/:id/attendees`
Add attendee.

Request:
```json
{
  "email": "guest@example.com",
  "role": "required"
}
```

### PATCH `/events/:id/attendees/:attendeeId`
Update RSVP.

Request:
```json
{ "status": "accepted" }
```

### DELETE `/events/:id/attendees/:attendeeId`
Remove attendee.

---

## 6. Reminders

### POST `/events/:id/reminders`
Upsert reminder(s).

Request:
```json
{
  "reminders": [
    { "type": "popup", "minutesBefore": 10 },
    { "type": "email", "minutesBefore": 60 }
  ]
}
```

---

## 7. Free/Busy

### POST `/freebusy`
Return busy intervals for calendars/users within a range.

Request:
```json
{
  "from": "2026-03-04T00:00:00Z",
  "to": "2026-03-11T00:00:00Z",
  "calendarIds": ["uuid1", "uuid2"]
}
```

Response:
```json
{
  "busy": [
    { "start": "2026-03-04T09:30:00Z", "end": "2026-03-04T10:00:00Z" }
  ]
}
```

---

## 8. Error Model

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "endAt must be greater than startAt"
  }
}
```
