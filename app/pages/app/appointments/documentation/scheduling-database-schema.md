# Scheduling Module — Database Schema (Postgres/Supabase)

Updated: 2026-03-04

Schema for a Google Calendar-like scheduling module.
Designed for RLS-friendly Supabase/Postgres.

---

## 1. Conventions

- UUID primary keys
- `timestamptz` for timestamps (UTC)
- Store `event_timezone` (IANA string)
- Prefer soft delete (archive) to preserve history

---

## 2. Enums (optional)

```sql
CREATE TYPE calendar_visibility AS ENUM ('private', 'shared', 'public');
CREATE TYPE attendee_status AS ENUM ('needs_action', 'accepted', 'tentative', 'declined');
CREATE TYPE attendee_role AS ENUM ('required', 'optional');
CREATE TYPE reminder_type AS ENUM ('popup', 'email', 'push');
CREATE TYPE exception_type AS ENUM ('cancelled', 'modified');
```

---

## 3. Tables

### 3.1 calendars

```sql
CREATE TABLE calendars (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_user_id uuid NOT NULL,

  name text NOT NULL,
  description text,
  color text, -- optional UI hint
  visibility calendar_visibility NOT NULL DEFAULT 'private',

  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  archived_at timestamptz
);

CREATE INDEX idx_calendars_owner ON calendars(owner_user_id);
```

---

### 3.2 calendar_shares (permissions)

```sql
CREATE TABLE calendar_shares (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  calendar_id uuid NOT NULL REFERENCES calendars(id) ON DELETE CASCADE,
  shared_with_user_id uuid NOT NULL,

  can_read boolean NOT NULL DEFAULT true,
  can_write boolean NOT NULL DEFAULT false,

  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (calendar_id, shared_with_user_id)
);

CREATE INDEX idx_calendar_shares_calendar ON calendar_shares(calendar_id);
CREATE INDEX idx_calendar_shares_user ON calendar_shares(shared_with_user_id);
```

---

### 3.3 events (single events + series root)

This table stores the base event data. If `rrule` is null → single event.
If `rrule` is not null → recurring series root event.

```sql
CREATE TABLE events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  calendar_id uuid NOT NULL REFERENCES calendars(id) ON DELETE CASCADE,
  owner_user_id uuid NOT NULL,

  title text NOT NULL,
  description text,
  location text,

  start_at timestamptz NOT NULL,
  end_at timestamptz NOT NULL,
  event_timezone text NOT NULL, -- IANA, e.g. Europe/Lisbon

  all_day boolean NOT NULL DEFAULT false,

  rrule text,       -- RFC 5545 RRULE, e.g. "FREQ=WEEKLY;BYDAY=MO,WE"
  exdate text[],    -- optional quick exclusions; prefer event_exceptions for full support

  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  archived_at timestamptz,

  CHECK (end_at > start_at)
);

CREATE INDEX idx_events_calendar ON events(calendar_id);
CREATE INDEX idx_events_owner ON events(owner_user_id);
CREATE INDEX idx_events_start_at ON events(start_at);
```

---

### 3.4 event_exceptions (modified/cancelled occurrences)

`recurrence_id` identifies the occurrence within the series.
Commonly the original occurrence start datetime in the event timezone, serialized as ISO string.

```sql
CREATE TABLE event_exceptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  type exception_type NOT NULL,

  recurrence_id text NOT NULL, -- identifies occurrence in the series

  -- For modified occurrence, store overridden fields:
  override_title text,
  override_description text,
  override_location text,
  override_start_at timestamptz,
  override_end_at timestamptz,

  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),

  UNIQUE (event_id, recurrence_id)
);

CREATE INDEX idx_event_exceptions_event ON event_exceptions(event_id);
```

---

### 3.5 event_attendees (optional)

```sql
CREATE TABLE event_attendees (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid NOT NULL REFERENCES events(id) ON DELETE CASCADE,

  attendee_user_id uuid, -- if internal user
  attendee_email text,   -- if external invite

  role attendee_role NOT NULL DEFAULT 'required',
  status attendee_status NOT NULL DEFAULT 'needs_action',

  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_event_attendees_event ON event_attendees(event_id);
```

---

### 3.6 event_reminders

Reminders can be per-event and per-user.
`minutes_before` is standard (e.g., 10 minutes before start).

```sql
CREATE TABLE event_reminders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,

  type reminder_type NOT NULL DEFAULT 'popup',
  minutes_before int NOT NULL,

  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),

  UNIQUE (event_id, user_id, type, minutes_before)
);

CREATE INDEX idx_event_reminders_event ON event_reminders(event_id);
CREATE INDEX idx_event_reminders_user ON event_reminders(user_id);
```

---

### 3.7 notification_jobs (optional outbox)

Use an outbox table for reliable delivery.

```sql
CREATE TABLE notification_jobs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,

  type text NOT NULL, -- 'reminder' | 'invite' | 'update'
  payload jsonb NOT NULL,

  run_at timestamptz NOT NULL,
  status text NOT NULL DEFAULT 'pending', -- pending | sent | failed
  attempts int NOT NULL DEFAULT 0,

  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_notification_jobs_run_at ON notification_jobs(run_at);
```

---

## 4. RLS Notes (Supabase)

- Enable RLS on all tables.
- Ownership rules:
  - calendars: owner OR shared permission
  - events: via calendar permission
  - exceptions/attendees/reminders: via event permission
- Use helper SQL functions (SECURITY DEFINER) to check access via calendar_shares.
