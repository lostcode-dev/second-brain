-- ============================================================================
-- Habits Module Migration
-- Based on Atomic Habits architecture
-- ============================================================================

-- 1. Custom types
CREATE TYPE habit_frequency AS ENUM ('daily', 'weekly', 'custom');
CREATE TYPE habit_difficulty AS ENUM ('tiny', 'normal', 'hard');
CREATE TYPE cue_type AS ENUM ('time', 'location', 'previous_habit', 'emotion');
CREATE TYPE reward_type AS ENUM ('points', 'badge', 'unlockable');

-- 2. Identities
CREATE TABLE identities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  archived_at timestamptz
);

CREATE INDEX idx_identities_user_id ON identities(user_id);

-- 3. Habits
CREATE TABLE habits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  identity_id uuid REFERENCES identities(id) ON DELETE SET NULL,
  name text NOT NULL,
  description text,
  frequency habit_frequency NOT NULL DEFAULT 'daily',
  difficulty habit_difficulty NOT NULL DEFAULT 'normal',
  custom_days smallint[],
  timezone text,
  archived_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT chk_custom_days CHECK (
    frequency != 'custom' OR custom_days IS NOT NULL
  )
);

CREATE INDEX idx_habits_user_id ON habits(user_id);
CREATE INDEX idx_habits_identity_id ON habits(identity_id);

-- 4. Habit Cues
CREATE TABLE habit_cues (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type cue_type NOT NULL,
  time_of_day time,
  location text,
  previous_habit_id uuid REFERENCES habits(id) ON DELETE SET NULL,
  description text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  archived_at timestamptz
);

CREATE INDEX idx_habit_cues_user_id ON habit_cues(user_id);
CREATE INDEX idx_habit_cues_previous_habit_id ON habit_cues(previous_habit_id);

-- 5. Habit Rewards
CREATE TABLE habit_rewards (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type reward_type NOT NULL,
  points int,
  badge_key text,
  unlock_key text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  archived_at timestamptz
);

CREATE INDEX idx_habit_rewards_user_id ON habit_rewards(user_id);

-- 6. Habit Settings (links habit -> cue + reward)
CREATE TABLE habit_settings (
  habit_id uuid PRIMARY KEY REFERENCES habits(id) ON DELETE CASCADE,
  cue_id uuid REFERENCES habit_cues(id) ON DELETE SET NULL,
  reward_id uuid REFERENCES habit_rewards(id) ON DELETE SET NULL,
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- 7. Habit Stacks
CREATE TABLE habit_stacks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  trigger_habit_id uuid NOT NULL REFERENCES habits(id) ON DELETE CASCADE,
  new_habit_id uuid NOT NULL REFERENCES habits(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  archived_at timestamptz
);

CREATE INDEX idx_habit_stacks_user_id ON habit_stacks(user_id);
CREATE INDEX idx_habit_stacks_trigger ON habit_stacks(trigger_habit_id);
CREATE INDEX idx_habit_stacks_new ON habit_stacks(new_habit_id);

-- 8. Habit Logs (one row per habit per date)
CREATE TABLE habit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  habit_id uuid NOT NULL REFERENCES habits(id) ON DELETE CASCADE,
  log_date date NOT NULL,
  completed boolean NOT NULL DEFAULT false,
  note text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (habit_id, log_date)
);

CREATE INDEX idx_habit_logs_user_id ON habit_logs(user_id);
CREATE INDEX idx_habit_logs_habit_id ON habit_logs(habit_id);
CREATE INDEX idx_habit_logs_log_date ON habit_logs(log_date);

-- 9. Habit Streaks (cache table)
CREATE TABLE habit_streaks (
  habit_id uuid PRIMARY KEY REFERENCES habits(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  current_streak int NOT NULL DEFAULT 0,
  longest_streak int NOT NULL DEFAULT 0,
  last_completed_date date,
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_habit_streaks_user_id ON habit_streaks(user_id);

-- 10. Habit Reflections (weekly review)
CREATE TABLE habit_reflections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  week_key text NOT NULL, -- e.g. '2026-W10'
  wins text,
  improvements text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, week_key)
);

CREATE INDEX idx_habit_reflections_user_id ON habit_reflections(user_id);

-- ============================================================================
-- RLS Policies
-- ============================================================================

ALTER TABLE identities ENABLE ROW LEVEL SECURITY;
ALTER TABLE habits ENABLE ROW LEVEL SECURITY;
ALTER TABLE habit_cues ENABLE ROW LEVEL SECURITY;
ALTER TABLE habit_rewards ENABLE ROW LEVEL SECURITY;
ALTER TABLE habit_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE habit_stacks ENABLE ROW LEVEL SECURITY;
ALTER TABLE habit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE habit_streaks ENABLE ROW LEVEL SECURITY;
ALTER TABLE habit_reflections ENABLE ROW LEVEL SECURITY;

-- Identities
CREATE POLICY identities_select ON identities FOR SELECT USING (user_id = auth.uid());
CREATE POLICY identities_insert ON identities FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY identities_update ON identities FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY identities_delete ON identities FOR DELETE USING (user_id = auth.uid());

-- Habits
CREATE POLICY habits_select ON habits FOR SELECT USING (user_id = auth.uid());
CREATE POLICY habits_insert ON habits FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY habits_update ON habits FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY habits_delete ON habits FOR DELETE USING (user_id = auth.uid());

-- Habit Cues
CREATE POLICY habit_cues_select ON habit_cues FOR SELECT USING (user_id = auth.uid());
CREATE POLICY habit_cues_insert ON habit_cues FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY habit_cues_update ON habit_cues FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY habit_cues_delete ON habit_cues FOR DELETE USING (user_id = auth.uid());

-- Habit Rewards
CREATE POLICY habit_rewards_select ON habit_rewards FOR SELECT USING (user_id = auth.uid());
CREATE POLICY habit_rewards_insert ON habit_rewards FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY habit_rewards_update ON habit_rewards FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY habit_rewards_delete ON habit_rewards FOR DELETE USING (user_id = auth.uid());

-- Habit Settings
CREATE POLICY habit_settings_select ON habit_settings FOR SELECT
  USING (EXISTS (SELECT 1 FROM habits WHERE habits.id = habit_settings.habit_id AND habits.user_id = auth.uid()));
CREATE POLICY habit_settings_insert ON habit_settings FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM habits WHERE habits.id = habit_settings.habit_id AND habits.user_id = auth.uid()));
CREATE POLICY habit_settings_update ON habit_settings FOR UPDATE
  USING (EXISTS (SELECT 1 FROM habits WHERE habits.id = habit_settings.habit_id AND habits.user_id = auth.uid()));
CREATE POLICY habit_settings_delete ON habit_settings FOR DELETE
  USING (EXISTS (SELECT 1 FROM habits WHERE habits.id = habit_settings.habit_id AND habits.user_id = auth.uid()));

-- Habit Stacks
CREATE POLICY habit_stacks_select ON habit_stacks FOR SELECT USING (user_id = auth.uid());
CREATE POLICY habit_stacks_insert ON habit_stacks FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY habit_stacks_update ON habit_stacks FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY habit_stacks_delete ON habit_stacks FOR DELETE USING (user_id = auth.uid());

-- Habit Logs
CREATE POLICY habit_logs_select ON habit_logs FOR SELECT USING (user_id = auth.uid());
CREATE POLICY habit_logs_insert ON habit_logs FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY habit_logs_update ON habit_logs FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY habit_logs_delete ON habit_logs FOR DELETE USING (user_id = auth.uid());

-- Habit Streaks
CREATE POLICY habit_streaks_select ON habit_streaks FOR SELECT USING (user_id = auth.uid());
CREATE POLICY habit_streaks_insert ON habit_streaks FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY habit_streaks_update ON habit_streaks FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY habit_streaks_delete ON habit_streaks FOR DELETE USING (user_id = auth.uid());

-- Habit Reflections
CREATE POLICY habit_reflections_select ON habit_reflections FOR SELECT USING (user_id = auth.uid());
CREATE POLICY habit_reflections_insert ON habit_reflections FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY habit_reflections_update ON habit_reflections FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY habit_reflections_delete ON habit_reflections FOR DELETE USING (user_id = auth.uid());
