-- ============================================================================
-- Goals Module Migration
-- ============================================================================

-- 1. Custom types
CREATE TYPE goal_time_category AS ENUM ('daily', 'weekly', 'monthly', 'quarterly', 'yearly', 'long_term');
CREATE TYPE goal_life_category AS ENUM ('personal', 'career', 'health', 'finance', 'spiritual', 'learning', 'relationships', 'lifestyle');
CREATE TYPE goal_status AS ENUM ('active', 'completed', 'archived');

-- 2. Goals
CREATE TABLE goals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  time_category goal_time_category NOT NULL DEFAULT 'monthly',
  life_category goal_life_category NOT NULL DEFAULT 'personal',
  status goal_status NOT NULL DEFAULT 'active',
  progress numeric NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  archived_at timestamptz
);

CREATE INDEX idx_goals_user_id ON goals(user_id);
CREATE INDEX idx_goals_status ON goals(user_id, status);
CREATE INDEX idx_goals_life_category ON goals(user_id, life_category);
CREATE INDEX idx_goals_time_category ON goals(user_id, time_category);

-- 3. Goal Tasks (subtasks)
CREATE TABLE goal_tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  goal_id uuid NOT NULL REFERENCES goals(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  completed boolean NOT NULL DEFAULT false,
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_goal_tasks_goal_id ON goal_tasks(goal_id);

-- 4. Goal-Habit links
CREATE TABLE goal_habits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  goal_id uuid NOT NULL REFERENCES goals(id) ON DELETE CASCADE,
  habit_id uuid NOT NULL REFERENCES habits(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (goal_id, habit_id)
);

CREATE INDEX idx_goal_habits_goal_id ON goal_habits(goal_id);
CREATE INDEX idx_goal_habits_habit_id ON goal_habits(habit_id);

-- ============================================================================
-- RLS Policies
-- ============================================================================

ALTER TABLE goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE goal_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE goal_habits ENABLE ROW LEVEL SECURITY;

-- Goals
CREATE POLICY goals_select ON goals FOR SELECT USING (user_id = auth.uid());
CREATE POLICY goals_insert ON goals FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY goals_update ON goals FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY goals_delete ON goals FOR DELETE USING (user_id = auth.uid());

-- Goal Tasks (enforce via goal ownership)
CREATE POLICY goal_tasks_select ON goal_tasks FOR SELECT
  USING (EXISTS (SELECT 1 FROM goals WHERE goals.id = goal_tasks.goal_id AND goals.user_id = auth.uid()));
CREATE POLICY goal_tasks_insert ON goal_tasks FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM goals WHERE goals.id = goal_tasks.goal_id AND goals.user_id = auth.uid()));
CREATE POLICY goal_tasks_update ON goal_tasks FOR UPDATE
  USING (EXISTS (SELECT 1 FROM goals WHERE goals.id = goal_tasks.goal_id AND goals.user_id = auth.uid()));
CREATE POLICY goal_tasks_delete ON goal_tasks FOR DELETE
  USING (EXISTS (SELECT 1 FROM goals WHERE goals.id = goal_tasks.goal_id AND goals.user_id = auth.uid()));

-- Goal Habits (enforce via goal ownership)
CREATE POLICY goal_habits_select ON goal_habits FOR SELECT
  USING (EXISTS (SELECT 1 FROM goals WHERE goals.id = goal_habits.goal_id AND goals.user_id = auth.uid()));
CREATE POLICY goal_habits_insert ON goal_habits FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM goals WHERE goals.id = goal_habits.goal_id AND goals.user_id = auth.uid()));
CREATE POLICY goal_habits_delete ON goal_habits FOR DELETE
  USING (EXISTS (SELECT 1 FROM goals WHERE goals.id = goal_habits.goal_id AND goals.user_id = auth.uid()));

-- ============================================================================
-- Function: auto-recalculate goal progress on task changes
-- ============================================================================

CREATE OR REPLACE FUNCTION recalculate_goal_progress()
RETURNS trigger AS $$
DECLARE
  v_goal_id uuid;
  v_total int;
  v_completed int;
  v_progress numeric;
BEGIN
  IF TG_OP = 'DELETE' THEN
    v_goal_id := OLD.goal_id;
  ELSE
    v_goal_id := NEW.goal_id;
  END IF;

  SELECT count(*), count(*) FILTER (WHERE completed = true)
  INTO v_total, v_completed
  FROM goal_tasks
  WHERE goal_id = v_goal_id;

  IF v_total > 0 THEN
    v_progress := round((v_completed::numeric / v_total::numeric) * 100, 1);
  ELSE
    v_progress := 0;
  END IF;

  UPDATE goals SET progress = v_progress, updated_at = now()
  WHERE id = v_goal_id;

  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_goal_task_progress
  AFTER INSERT OR UPDATE OR DELETE ON goal_tasks
  FOR EACH ROW EXECUTE FUNCTION recalculate_goal_progress();
