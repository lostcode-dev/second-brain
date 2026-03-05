-- ============================================================================
-- Scheduling Module Migration (MVP)
-- Tables: calendars, events, event_exceptions, event_reminders
-- ============================================================================

-- ─── Enums ──────────────────────────────────────────────────────────────────

CREATE TYPE calendar_visibility AS ENUM ('private', 'shared', 'public');
CREATE TYPE exception_type AS ENUM ('cancelled', 'modified');
CREATE TYPE reminder_type AS ENUM ('popup', 'email', 'push');

-- ─── 1. Calendars ──────────────────────────────────────────────────────────

CREATE TABLE calendars (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  name text NOT NULL,
  description text,
  color text,
  visibility calendar_visibility NOT NULL DEFAULT 'private',

  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  archived_at timestamptz
);

CREATE INDEX idx_calendars_owner ON calendars(owner_user_id);

-- ─── 2. Events ─────────────────────────────────────────────────────────────

CREATE TABLE events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  calendar_id uuid NOT NULL REFERENCES calendars(id) ON DELETE CASCADE,
  owner_user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  title text NOT NULL,
  description text,
  location text,

  start_at timestamptz NOT NULL,
  end_at timestamptz NOT NULL,
  event_timezone text NOT NULL,

  all_day boolean NOT NULL DEFAULT false,

  rrule text,
  exdate text[],

  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  archived_at timestamptz,

  CHECK (end_at > start_at)
);

CREATE INDEX idx_events_calendar ON events(calendar_id);
CREATE INDEX idx_events_owner ON events(owner_user_id);
CREATE INDEX idx_events_start_at ON events(start_at);
CREATE INDEX idx_events_calendar_range ON events(calendar_id, start_at, end_at);

-- ─── 3. Event Exceptions ───────────────────────────────────────────────────

CREATE TABLE event_exceptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  type exception_type NOT NULL,

  recurrence_id text NOT NULL,

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

-- ─── 4. Event Reminders ────────────────────────────────────────────────────

CREATE TABLE event_reminders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  type reminder_type NOT NULL DEFAULT 'popup',
  minutes_before int NOT NULL,

  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),

  UNIQUE (event_id, user_id, type, minutes_before)
);

CREATE INDEX idx_event_reminders_event ON event_reminders(event_id);
CREATE INDEX idx_event_reminders_user ON event_reminders(user_id);

-- ─── RLS ────────────────────────────────────────────────────────────────────

ALTER TABLE calendars ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_exceptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_reminders ENABLE ROW LEVEL SECURITY;

-- Calendars: owner can do everything
CREATE POLICY calendars_select ON calendars
  FOR SELECT USING (owner_user_id = auth.uid());

CREATE POLICY calendars_insert ON calendars
  FOR INSERT WITH CHECK (owner_user_id = auth.uid());

CREATE POLICY calendars_update ON calendars
  FOR UPDATE USING (owner_user_id = auth.uid());

CREATE POLICY calendars_delete ON calendars
  FOR DELETE USING (owner_user_id = auth.uid());

-- Events: owner can do everything
CREATE POLICY events_select ON events
  FOR SELECT USING (owner_user_id = auth.uid());

CREATE POLICY events_insert ON events
  FOR INSERT WITH CHECK (owner_user_id = auth.uid());

CREATE POLICY events_update ON events
  FOR UPDATE USING (owner_user_id = auth.uid());

CREATE POLICY events_delete ON events
  FOR DELETE USING (owner_user_id = auth.uid());

-- Event exceptions: via event ownership
CREATE POLICY event_exceptions_select ON event_exceptions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM events
      WHERE events.id = event_exceptions.event_id
        AND events.owner_user_id = auth.uid()
    )
  );

CREATE POLICY event_exceptions_insert ON event_exceptions
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM events
      WHERE events.id = event_exceptions.event_id
        AND events.owner_user_id = auth.uid()
    )
  );

CREATE POLICY event_exceptions_update ON event_exceptions
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM events
      WHERE events.id = event_exceptions.event_id
        AND events.owner_user_id = auth.uid()
    )
  );

CREATE POLICY event_exceptions_delete ON event_exceptions
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM events
      WHERE events.id = event_exceptions.event_id
        AND events.owner_user_id = auth.uid()
    )
  );

-- Event reminders: user can manage own reminders
CREATE POLICY event_reminders_select ON event_reminders
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY event_reminders_insert ON event_reminders
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY event_reminders_update ON event_reminders
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY event_reminders_delete ON event_reminders
  FOR DELETE USING (user_id = auth.uid());
