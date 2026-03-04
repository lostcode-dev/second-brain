# Journal Module — Database Schema (Postgres/Supabase)

Updated: 2026-03-04

Schema for a daily journal module with metrics, designed for Supabase/Postgres and RLS.

---

## 1. Conventions

- UUID primary keys
- Use `date` for local day (`entry_date`)
- Use `timestamptz` for `created_at/updated_at`
- Prefer soft delete (`archived_at`) where needed

---

## 2. Enums (optional)

```sql
CREATE TYPE metric_type AS ENUM ('number', 'scale', 'boolean', 'select', 'text');
```

---

## 3. Tables

### 3.1 journal_entries

One entry per user per local date.

```sql
CREATE TABLE journal_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,

  entry_date date NOT NULL, -- local date in user's timezone
  title text,
  content text NOT NULL, -- markdown or serialized rich text JSON (if preferred)

  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  archived_at timestamptz,

  UNIQUE (user_id, entry_date)
);

CREATE INDEX idx_journal_entries_user ON journal_entries(user_id);
CREATE INDEX idx_journal_entries_date ON journal_entries(entry_date);
```

---

### 3.2 journal_tags

```sql
CREATE TABLE journal_tags (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  name text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, name)
);

CREATE INDEX idx_journal_tags_user ON journal_tags(user_id);
```

---

### 3.3 journal_entry_tags (many-to-many)

```sql
CREATE TABLE journal_entry_tags (
  entry_id uuid NOT NULL REFERENCES journal_entries(id) ON DELETE CASCADE,
  tag_id uuid NOT NULL REFERENCES journal_tags(id) ON DELETE CASCADE,
  PRIMARY KEY (entry_id, tag_id)
);
```

---

### 3.4 metric_definitions

Predefined or custom metrics per user.

```sql
CREATE TABLE metric_definitions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,

  key text NOT NULL,         -- e.g. "mood", "sleep_hours"
  name text NOT NULL,        -- e.g. "Mood", "Sleep (hours)"
  description text,

  type metric_type NOT NULL,

  unit text,                 -- e.g. "hours", "score", "minutes"
  min_value numeric,         -- for number/scale
  max_value numeric,
  step numeric,              -- e.g. 1, 0.5
  options text[],            -- for select
  is_active boolean NOT NULL DEFAULT true,

  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),

  UNIQUE (user_id, key)
);

CREATE INDEX idx_metric_definitions_user ON metric_definitions(user_id);
```

---

### 3.5 metric_values (daily)

One metric value per (user, date, definition).

```sql
CREATE TABLE metric_values (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  entry_date date NOT NULL,
  metric_definition_id uuid NOT NULL REFERENCES metric_definitions(id) ON DELETE CASCADE,

  -- store values in typed columns to simplify querying
  number_value numeric,
  boolean_value boolean,
  text_value text,
  select_value text,

  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),

  UNIQUE (user_id, entry_date, metric_definition_id)
);

CREATE INDEX idx_metric_values_user_date ON metric_values(user_id, entry_date);
CREATE INDEX idx_metric_values_definition ON metric_values(metric_definition_id);
```

Notes:
- Use only one of the value columns depending on metric type.
- For scale metrics, store in `number_value`.

---

### 3.6 prompt_templates (optional)

```sql
CREATE TABLE prompt_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  name text NOT NULL,
  prompts text[] NOT NULL,

  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  archived_at timestamptz
);

CREATE INDEX idx_prompt_templates_user ON prompt_templates(user_id);
```

---

## 4. RLS Notes (Supabase)

- Enable RLS on all tables.
- Policies:
  - `user_id = auth.uid()` for SELECT/INSERT/UPDATE/DELETE
- For join tables (`journal_entry_tags`), enforce via entry/tag ownership checks.

---

## 5. Optional Views

- Weekly averages per metric
- Rolling 7-day mood average
- Correlation view (sleep vs mood) — computed in app layer first
