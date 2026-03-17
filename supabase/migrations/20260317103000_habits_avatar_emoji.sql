-- ============================================================================
-- Habits Module — Avatar emoji
-- ============================================================================

ALTER TABLE habits
  ADD COLUMN IF NOT EXISTS avatar_emoji text;

ALTER TABLE habit_versions
  ADD COLUMN IF NOT EXISTS avatar_emoji text;

UPDATE habit_versions hv
SET avatar_emoji = h.avatar_emoji
FROM habits h
WHERE hv.habit_id = h.id
AND hv.avatar_emoji IS NULL;
