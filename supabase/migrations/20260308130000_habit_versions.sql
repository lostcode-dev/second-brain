-- ============================================================================
-- Habits Module — Immutable habit versions for historical logs
-- ============================================================================

CREATE TABLE habit_versions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  habit_id uuid NOT NULL REFERENCES habits(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  identity_id uuid REFERENCES identities(id) ON DELETE SET NULL,
  name text NOT NULL,
  description text,
  obvious_strategy text,
  attractive_strategy text,
  easy_strategy text,
  satisfying_strategy text,
  frequency habit_frequency NOT NULL,
  difficulty habit_difficulty NOT NULL,
  habit_type habit_type NOT NULL,
  custom_days smallint[],
  sort_order int NOT NULL DEFAULT 0,
  timezone text,
  valid_from date NOT NULL,
  valid_to date,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_habit_versions_habit_id ON habit_versions(habit_id);
CREATE INDEX idx_habit_versions_user_id ON habit_versions(user_id);
CREATE INDEX idx_habit_versions_valid_range ON habit_versions(habit_id, valid_from, valid_to);

ALTER TABLE habit_versions ENABLE ROW LEVEL SECURITY;

CREATE POLICY habit_versions_select ON habit_versions FOR SELECT USING (user_id = auth.uid());
CREATE POLICY habit_versions_insert ON habit_versions FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY habit_versions_update ON habit_versions FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY habit_versions_delete ON habit_versions FOR DELETE USING (user_id = auth.uid());

INSERT INTO habit_versions (
  habit_id,
  user_id,
  identity_id,
  name,
  description,
  obvious_strategy,
  attractive_strategy,
  easy_strategy,
  satisfying_strategy,
  frequency,
  difficulty,
  habit_type,
  custom_days,
  sort_order,
  timezone,
  valid_from,
  valid_to,
  created_at,
  updated_at
)
SELECT
  h.id,
  h.user_id,
  h.identity_id,
  h.name,
  h.description,
  h.obvious_strategy,
  h.attractive_strategy,
  h.easy_strategy,
  h.satisfying_strategy,
  h.frequency,
  h.difficulty,
  h.habit_type,
  h.custom_days,
  h.sort_order,
  h.timezone,
  COALESCE(h.created_at::date, CURRENT_DATE),
  NULL,
  h.created_at,
  h.updated_at
FROM habits h;

ALTER TABLE habit_logs
  ADD COLUMN habit_version_id uuid REFERENCES habit_versions(id) ON DELETE RESTRICT;

UPDATE habit_logs hl
SET habit_version_id = hv.id
FROM habit_versions hv
WHERE hv.habit_id = hl.habit_id
  AND hv.user_id = hl.user_id
  AND hl.habit_version_id IS NULL;

ALTER TABLE habit_logs
  ALTER COLUMN habit_version_id SET NOT NULL;

CREATE INDEX idx_habit_logs_habit_version_id ON habit_logs(habit_version_id);