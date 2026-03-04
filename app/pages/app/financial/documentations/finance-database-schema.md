# Finance Module --- Database Schema

Updated: 2026-03-04

------------------------------------------------------------------------

## financial_categories

``` sql
CREATE TABLE financial_categories (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 user_id uuid NOT NULL,
 name text NOT NULL
);
```

------------------------------------------------------------------------

## incomes

``` sql
CREATE TABLE incomes (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 user_id uuid NOT NULL,

 source text,
 amount numeric,
 date date,

 recurring boolean DEFAULT false,
 recurring_day integer
);
```

------------------------------------------------------------------------

## expenses

``` sql
CREATE TABLE expenses (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 user_id uuid NOT NULL,

 description text,
 amount numeric,

 category_id uuid REFERENCES financial_categories(id),

 date date,

 recurring boolean DEFAULT false,
 recurring_day integer
);
```

------------------------------------------------------------------------

## debts

``` sql
CREATE TABLE debts (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 user_id uuid NOT NULL,

 name text,
 total_amount numeric,
 remaining_amount numeric,

 created_at timestamptz DEFAULT now()
);
```

------------------------------------------------------------------------

## debt_installments

``` sql
CREATE TABLE debt_installments (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 debt_id uuid REFERENCES debts(id),

 amount numeric,
 due_date date,
 paid boolean DEFAULT false
);
```

------------------------------------------------------------------------

## assets

``` sql
CREATE TABLE assets (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 user_id uuid NOT NULL,

 name text,
 value numeric
);
```

------------------------------------------------------------------------

## financial_links

Links finances with Life OS entities.

``` sql
CREATE TABLE financial_links (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),

 finance_type text,
 finance_id uuid,

 target_type text,
 target_id uuid
);
```
