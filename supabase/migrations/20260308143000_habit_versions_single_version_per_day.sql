-- ==========================================================================
-- Habits Module — Keep only one version per habit per day
-- ==========================================================================

WITH ranked_versions AS (
  SELECT
    hv.id,
    hv.habit_id,
    hv.valid_from,
    ROW_NUMBER() OVER (
      PARTITION BY hv.habit_id, hv.valid_from
      ORDER BY hv.updated_at DESC, hv.created_at DESC, hv.id DESC
    ) AS rank,
    FIRST_VALUE(hv.id) OVER (
      PARTITION BY hv.habit_id, hv.valid_from
      ORDER BY hv.updated_at DESC, hv.created_at DESC, hv.id DESC
    ) AS kept_id
  FROM habit_versions hv
), duplicate_versions AS (
  SELECT id, kept_id
  FROM ranked_versions
  WHERE rank > 1
)
UPDATE habit_logs hl
SET habit_version_id = dv.kept_id
FROM duplicate_versions dv
WHERE hl.habit_version_id = dv.id;

WITH ranked_versions AS (
  SELECT
    hv.id,
    ROW_NUMBER() OVER (
      PARTITION BY hv.habit_id, hv.valid_from
      ORDER BY hv.updated_at DESC, hv.created_at DESC, hv.id DESC
    ) AS rank
  FROM habit_versions hv
)
DELETE FROM habit_versions hv
USING ranked_versions rv
WHERE hv.id = rv.id
  AND rv.rank > 1;

CREATE UNIQUE INDEX IF NOT EXISTS idx_habit_versions_habit_day_unique
  ON habit_versions(habit_id, valid_from);