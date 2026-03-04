# Life OS Module --- Database Schema

Updated: 2026-03-04

------------------------------------------------------------------------

## life_areas

``` sql
CREATE TABLE life_areas (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 user_id uuid NOT NULL,
 name text NOT NULL
);
```

Examples:

health\
career\
finance\
learning\
relationships\
spiritual

------------------------------------------------------------------------

## entity_links

Universal linking between modules.

``` sql
CREATE TABLE entity_links (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),

 source_type text NOT NULL,
 source_id uuid NOT NULL,

 target_type text NOT NULL,
 target_id uuid NOT NULL,

 created_at timestamptz DEFAULT now()
);
```

Example links:

goal → habit\
goal → task\
idea → note\
task → event

------------------------------------------------------------------------

## life_dashboards

``` sql
CREATE TABLE life_dashboards (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 user_id uuid NOT NULL,

 created_at timestamptz DEFAULT now()
);
```
