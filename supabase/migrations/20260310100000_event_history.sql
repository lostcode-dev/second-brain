-- ============================================================================
-- Event History / Audit Trail
-- Stores snapshots of event data before each update for history tracking
-- ============================================================================

CREATE TABLE event_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  changed_by uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Snapshot of the event at the time of change
  title text NOT NULL,
  description text,
  location text,
  start_at timestamptz NOT NULL,
  end_at timestamptz NOT NULL,
  event_timezone text NOT NULL,
  all_day boolean NOT NULL DEFAULT false,
  rrule text,
  calendar_id uuid NOT NULL,

  -- Change metadata
  change_type text NOT NULL DEFAULT 'update', -- 'create', 'update', 'archive'

  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_event_history_event ON event_history(event_id);
CREATE INDEX idx_event_history_created ON event_history(event_id, created_at DESC);

-- ─── RLS ────────────────────────────────────────────────────────────────────

ALTER TABLE event_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY event_history_select ON event_history
  FOR SELECT USING (changed_by = auth.uid());

CREATE POLICY event_history_insert ON event_history
  FOR INSERT WITH CHECK (changed_by = auth.uid());
