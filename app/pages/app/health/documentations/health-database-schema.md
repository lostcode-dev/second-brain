# Health Module --- Database Schema

Updated: 2026-03-04

------------------------------------------------------------------------

## health_metrics

``` sql
CREATE TABLE health_metrics (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 user_id uuid NOT NULL,

 type text,
 value numeric,
 date date
);
```

Examples:

weight\
blood_pressure\
heart_rate

------------------------------------------------------------------------

## meals

``` sql
CREATE TABLE meals (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 user_id uuid NOT NULL,

 name text,
 calories numeric,

 protein numeric,
 carbs numeric,
 fat numeric,

 date date
);
```

------------------------------------------------------------------------

## workouts

``` sql
CREATE TABLE workouts (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 user_id uuid NOT NULL,

 name text,
 duration integer,

 date date
);
```

------------------------------------------------------------------------

## exercises

``` sql
CREATE TABLE exercises (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 workout_id uuid REFERENCES workouts(id),

 name text,
 sets integer,
 reps integer,
 weight numeric
);
```

------------------------------------------------------------------------

## medical_records

``` sql
CREATE TABLE medical_records (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 user_id uuid NOT NULL,

 title text,
 description text,
 date date
);
```

------------------------------------------------------------------------

## medical_documents

``` sql
CREATE TABLE medical_documents (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 record_id uuid REFERENCES medical_records(id),

 file_url text,
 file_name text,
 uploaded_at timestamptz DEFAULT now()
);
```
