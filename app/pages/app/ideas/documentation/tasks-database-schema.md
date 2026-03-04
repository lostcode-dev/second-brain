# Tasks Module --- Database Schema

Updated: 2026-03-04

Database schema for the task management module.

------------------------------------------------------------------------

## task_lists

``` sql
CREATE TABLE task_lists (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 user_id uuid NOT NULL,

 name text NOT NULL,
 color text,

 created_at timestamptz DEFAULT now()
);
```

------------------------------------------------------------------------

## tasks

``` sql
CREATE TABLE tasks (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 user_id uuid NOT NULL,
 list_id uuid REFERENCES task_lists(id),

 title text NOT NULL,
 description text,

 priority text,
 status text DEFAULT 'pending',

 due_date date,

 created_at timestamptz DEFAULT now(),
 updated_at timestamptz DEFAULT now()
);
```

------------------------------------------------------------------------

## task_subtasks

``` sql
CREATE TABLE task_subtasks (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 task_id uuid REFERENCES tasks(id) ON DELETE CASCADE,

 title text NOT NULL,
 completed boolean DEFAULT false
);
```

------------------------------------------------------------------------

## task_tags

``` sql
CREATE TABLE task_tags (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 user_id uuid NOT NULL,
 name text
);
```

------------------------------------------------------------------------

## task_tag_links

``` sql
CREATE TABLE task_tag_links (
 task_id uuid REFERENCES tasks(id),
 tag_id uuid REFERENCES task_tags(id),
 PRIMARY KEY (task_id, tag_id)
);
```
