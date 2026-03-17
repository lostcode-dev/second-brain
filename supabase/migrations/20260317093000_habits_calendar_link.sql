-- ============================================================================
-- Habits Module — Calendar link for scheduled habits
-- ============================================================================

ALTER TABLE habits
  ADD COLUMN IF NOT EXISTS calendar_id uuid REFERENCES calendars(id) ON DELETE SET NULL;

ALTER TABLE habit_versions
  ADD COLUMN IF NOT EXISTS calendar_id uuid REFERENCES calendars(id) ON DELETE SET NULL;

UPDATE habit_versions hv
SET calendar_id = h.calendar_id
FROM habits h
WHERE hv.habit_id = h.id
AND hv.calendar_id IS NULL;

CREATE INDEX IF NOT EXISTS idx_habits_calendar_id ON habits(calendar_id);
CREATE INDEX IF NOT EXISTS idx_habit_versions_calendar_id ON habit_versions(calendar_id);
