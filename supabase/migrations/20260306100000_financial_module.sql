-- ============================================================================
-- Financial Module Migration
-- Created: 2026-03-06
-- ============================================================================

-- ─── Financial Categories ──────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS financial_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  icon text,
  color text,
  type text NOT NULL DEFAULT 'expense' CHECK (type IN ('income', 'expense')),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_financial_categories_user ON financial_categories(user_id);

ALTER TABLE financial_categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own categories" ON financial_categories
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ─── Incomes ───────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS incomes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  source text NOT NULL,
  description text,
  amount numeric NOT NULL CHECK (amount >= 0),
  date date NOT NULL DEFAULT CURRENT_DATE,
  recurring boolean NOT NULL DEFAULT false,
  recurring_day integer CHECK (recurring_day IS NULL OR (recurring_day >= 1 AND recurring_day <= 31)),
  category_id uuid REFERENCES financial_categories(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_incomes_user ON incomes(user_id);
CREATE INDEX idx_incomes_date ON incomes(user_id, date);
CREATE INDEX idx_incomes_category ON incomes(category_id);

ALTER TABLE incomes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own incomes" ON incomes
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ─── Expenses ──────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS expenses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  description text NOT NULL,
  amount numeric NOT NULL CHECK (amount >= 0),
  date date NOT NULL DEFAULT CURRENT_DATE,
  recurring boolean NOT NULL DEFAULT false,
  recurring_day integer CHECK (recurring_day IS NULL OR (recurring_day >= 1 AND recurring_day <= 31)),
  category_id uuid REFERENCES financial_categories(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_expenses_user ON expenses(user_id);
CREATE INDEX idx_expenses_date ON expenses(user_id, date);
CREATE INDEX idx_expenses_category ON expenses(category_id);

ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own expenses" ON expenses
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ─── Debts ─────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS debts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  total_amount numeric NOT NULL CHECK (total_amount >= 0),
  remaining_amount numeric NOT NULL CHECK (remaining_amount >= 0),
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'paid_off')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_debts_user ON debts(user_id);
CREATE INDEX idx_debts_status ON debts(user_id, status);

ALTER TABLE debts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own debts" ON debts
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ─── Debt Installments ─────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS debt_installments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  debt_id uuid NOT NULL REFERENCES debts(id) ON DELETE CASCADE,
  amount numeric NOT NULL CHECK (amount >= 0),
  due_date date NOT NULL,
  paid boolean NOT NULL DEFAULT false,
  paid_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_debt_installments_debt ON debt_installments(debt_id);
CREATE INDEX idx_debt_installments_due ON debt_installments(debt_id, due_date);

ALTER TABLE debt_installments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage installments of own debts" ON debt_installments
  FOR ALL USING (
    EXISTS (SELECT 1 FROM debts WHERE debts.id = debt_installments.debt_id AND debts.user_id = auth.uid())
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM debts WHERE debts.id = debt_installments.debt_id AND debts.user_id = auth.uid())
  );

-- ─── Assets ────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS assets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  value numeric NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_assets_user ON assets(user_id);

ALTER TABLE assets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own assets" ON assets
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ─── Seed default categories ──────────────────────────────────────────────
-- These will be created per-user via the app, but we define suggested ones
-- as a reference. No actual seeding here — the app creates defaults on first use.
