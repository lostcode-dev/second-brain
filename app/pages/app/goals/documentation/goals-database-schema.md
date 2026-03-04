# Goals Module --- Database Schema

Updated: 2026-03-04

Database schema for goals and tasks.

------------------------------------------------------------------------

## goals

``` sql
CREATE TABLE goals (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 user_id uuid NOT NULL,

 title text NOT NULL,
 description text,

 time_category text,
 life_category text,

 progress numeric DEFAULT 0,

 created_at timestamptz DEFAULT now(),
 updated_at timestamptz DEFAULT now()
);
```

------------------------------------------------------------------------

## goal_tasks

``` sql
CREATE TABLE goal_tasks (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 goal_id uuid REFERENCES goals(id) ON DELETE CASCADE,

 title text NOT NULL,
 description text,
 completed boolean DEFAULT false,

 created_at timestamptz DEFAULT now()
);
```

------------------------------------------------------------------------

## goal_habits

``` sql
CREATE TABLE goal_habits (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 goal_id uuid REFERENCES goals(id) ON DELETE CASCADE,
 habit_id uuid NOT NULL
);
```

------------------------------------------------------------------------

## goal_categories_time

Examples: daily weekly monthly yearly long_term

------------------------------------------------------------------------

## goal_categories_life

Examples: personal career health finance spiritual learning
relationships
