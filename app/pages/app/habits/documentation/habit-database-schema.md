# Habit Module — Database Schema (Postgres/Supabase)

Updated: 2026-03-04

This schema is designed for a SaaS Habit module inspired by Atomic Habits.
It aims to be RLS-friendly for Supabase and scalable for analytics.

---

## 1. Conventions

- Use `uuid` primary keys
- Use `timestamptz` for timestamps
- Store day-based logs as `date` (local date) + compute per user timezone
- Prefer `archived_at` instead of hard delete

---

## 2. Enums (optional)

```sql
-- You can use TEXT + CHECK constraints instead of enums if you prefer migrations simplicity.
CREATE TYPE habit_frequency AS ENUM ('daily', 'weekly', 'custom');
CREATE TYPE habit_difficulty AS ENUM ('tiny', 'normal', 'hard');
CREATE TYPE cue_type AS ENUM ('time', 'location', 'previous_habit', 'emotion');
CREATE TYPE reward_type AS ENUM ('points', 'badge', 'unlockable');
```

---

## 3. Tables

### 3.1 identities

```sql
CREATE TABLE identities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  name text NOT NULL,
  description text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  archived_at timestamptz
);

CREATE INDEX idx_identities_user_id ON identities(user_id);
```

---

### 3.2 habits

```sql
CREATE TABLE habits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  identity_id uuid REFERENCES identities(id),

  name text NOT NULL,
  description text,

  frequency habit_frequency NOT NULL DEFAULT 'daily',
  difficulty habit_difficulty NOT NULL DEFAULT 'normal',

  -- for 'custom' frequency, store days as int array (0=Sun..6=Sat) or jsonb
  custom_days smallint[],
  timezone text, -- optional per habit; else rely on user profile timezone

  archived_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_habits_user_id ON habits(user_id);
CREATE INDEX idx_habits_identity_id ON habits(identity_id);
```

Notes:
- If `frequency='custom'`, ensure `custom_days` is not null (use CHECK constraint if desired).

---

### 3.3 habit_cues

```sql
CREATE TABLE habit_cues (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  type cue_type NOT NULL,

  time_of_day time,
  location text,
  previous_habit_id uuid REFERENCES habits(id),
  description text,

  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  archived_at timestamptz
);

CREATE INDEX idx_habit_cues_user_id ON habit_cues(user_id);
CREATE INDEX idx_habit_cues_previous_habit_id ON habit_cues(previous_habit_id);
```

---

### 3.4 habit_rewards

```sql
CREATE TABLE habit_rewards (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  type reward_type NOT NULL,

  points int,
  badge_key text,
  unlock_key text,

  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  archived_at timestamptz
);

CREATE INDEX idx_habit_rewards_user_id ON habit_rewards(user_id);
```

---

### 3.5 habit_settings (links habit to cue/reward)

```sql
CREATE TABLE habit_settings (
  habit_id uuid PRIMARY KEY REFERENCES habits(id) ON DELETE CASCADE,
  cue_id uuid REFERENCES habit_cues(id),
  reward_id uuid REFERENCES habit_rewards(id),

  updated_at timestamptz NOT NULL DEFAULT now()
);
```

---

### 3.6 habit_stacks (habit stacking)

```sql
CREATE TABLE habit_stacks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  trigger_habit_id uuid NOT NULL REFERENCES habits(id) ON DELETE CASCADE,
  new_habit_id uuid NOT NULL REFERENCES habits(id) ON DELETE CASCADE,

  created_at timestamptz NOT NULL DEFAULT now(),
  archived_at timestamptz
);

CREATE INDEX idx_habit_stacks_user_id ON habit_stacks(user_id);
CREATE INDEX idx_habit_stacks_trigger ON habit_stacks(trigger_habit_id);
CREATE INDEX idx_habit_stacks_new ON habit_stacks(new_habit_id);
```

---

### 3.7 habit_logs

Design choice: one row per habit per date.

```sql
CREATE TABLE habit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
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
```

---

### 3.8 habit_streaks (cache)

```sql
CREATE TABLE habit_streaks (
  habit_id uuid PRIMARY KEY REFERENCES habits(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,

  current_streak int NOT NULL DEFAULT 0,
  longest_streak int NOT NULL DEFAULT 0,
  last_completed_date date,

  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_habit_streaks_user_id ON habit_streaks(user_id);
```

---

### 3.9 habit_reflections (weekly review)

```sql
CREATE TABLE habit_reflections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,

  week_key text NOT NULL, -- e.g. '2026-W10'
  wins text,
  improvements text,

  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),

  UNIQUE (user_id, week_key)
);

CREATE INDEX idx_habit_reflections_user_id ON habit_reflections(user_id);
```

---

## 4. RLS Notes (Supabase)

Typical rules:
- Enable RLS on all tables.
- Policy: `user_id = auth.uid()` for SELECT/INSERT/UPDATE/DELETE.
- For `habit_settings`/`habit_streaks`, enforce ownership via joins or duplicated `user_id`.

---

## 5. Analytics Views (optional)

Examples:
- completion rate by week
- habits per identity
- streak distribution

Create materialized views if dashboard needs speed at scale.
