import { getSupabaseAdminClient } from '../../utils/supabase'
import { requireAuthUser } from '../../utils/require-auth'

export default eventHandler(async (event) => {
  const user = await requireAuthUser(event)
  const supabase = getSupabaseAdminClient()

  const now = new Date()
  const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0]!
  const currentMonthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0]!
  const prevMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString().split('T')[0]!
  const prevMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0).toISOString().split('T')[0]!

  // Parallel queries
  const [
    currentIncomes,
    currentExpenses,
    prevIncomes,
    prevExpenses,
    debtsResult,
    assetsResult,
    expensesWithCategory
  ] = await Promise.all([
    // Current month incomes
    supabase
      .from('incomes')
      .select('amount')
      .eq('user_id', user.id)
      .gte('date', currentMonthStart)
      .lte('date', currentMonthEnd),

    // Current month expenses
    supabase
      .from('expenses')
      .select('amount')
      .eq('user_id', user.id)
      .gte('date', currentMonthStart)
      .lte('date', currentMonthEnd),

    // Previous month incomes
    supabase
      .from('incomes')
      .select('amount')
      .eq('user_id', user.id)
      .gte('date', prevMonthStart)
      .lte('date', prevMonthEnd),

    // Previous month expenses
    supabase
      .from('expenses')
      .select('amount')
      .eq('user_id', user.id)
      .gte('date', prevMonthStart)
      .lte('date', prevMonthEnd),

    // Active debts
    supabase
      .from('debts')
      .select('remaining_amount')
      .eq('user_id', user.id)
      .eq('status', 'active'),

    // Assets
    supabase
      .from('assets')
      .select('value')
      .eq('user_id', user.id),

    // Expenses with category for breakdown (current month)
    supabase
      .from('expenses')
      .select('amount, category:financial_categories(id, name)')
      .eq('user_id', user.id)
      .gte('date', currentMonthStart)
      .lte('date', currentMonthEnd)
  ])

  const sumAmount = (rows: Record<string, unknown>[] | null, field: string = 'amount'): number =>
    (rows ?? []).reduce((sum, r) => sum + Number(r[field] ?? 0), 0)

  const currentMonthIncome = sumAmount(currentIncomes.data)
  const currentMonthExpenses = sumAmount(currentExpenses.data)
  const previousMonthIncome = sumAmount(prevIncomes.data)
  const previousMonthExpenses = sumAmount(prevExpenses.data)
  const totalDebt = sumAmount(debtsResult.data, 'remaining_amount')
  const totalAssets = sumAmount(assetsResult.data, 'value')

  // Expenses by category
  const categoryTotals: Record<string, { name: string; total: number }> = {}
  for (const row of (expensesWithCategory.data ?? []) as Record<string, unknown>[]) {
    const cat = row.category as Record<string, unknown> | null
    const catId = cat?.id as string ?? '__uncategorized'
    const catName = cat?.name as string ?? 'Sem categoria'
    if (!categoryTotals[catId]) {
      categoryTotals[catId] = { name: catName, total: 0 }
    }
    categoryTotals[catId]!.total += Number(row.amount ?? 0)
  }

  const totalExpenseForCategory = Object.values(categoryTotals).reduce((s, c) => s + c.total, 0)
  const expensesByCategory = Object.entries(categoryTotals)
    .map(([catId, val]) => ({
      categoryId: catId === '__uncategorized' ? null : catId,
      categoryName: val.name,
      total: val.total,
      percentage: totalExpenseForCategory > 0 ? Math.round((val.total / totalExpenseForCategory) * 100) : 0
    }))
    .sort((a, b) => b.total - a.total)

  // Recent transactions (last 10)
  const [recentIncomesRes, recentExpensesRes] = await Promise.all([
    supabase
      .from('incomes')
      .select('id, source, amount, date, category:financial_categories(name)')
      .eq('user_id', user.id)
      .order('date', { ascending: false })
      .limit(5),
    supabase
      .from('expenses')
      .select('id, description, amount, date, category:financial_categories(name)')
      .eq('user_id', user.id)
      .order('date', { ascending: false })
      .limit(5)
  ])

  const recentTransactions = [
    ...(recentIncomesRes.data ?? []).map((r: Record<string, unknown>) => ({
      id: r.id as string,
      type: 'income' as const,
      description: r.source as string,
      amount: Number(r.amount),
      date: r.date as string,
      categoryName: (r.category as Record<string, unknown> | null)?.name as string | null ?? null
    })),
    ...(recentExpensesRes.data ?? []).map((r: Record<string, unknown>) => ({
      id: r.id as string,
      type: 'expense' as const,
      description: r.description as string,
      amount: Number(r.amount),
      date: r.date as string,
      categoryName: (r.category as Record<string, unknown> | null)?.name as string | null ?? null
    }))
  ]
    .sort((a, b) => (a.date < b.date ? 1 : -1))
    .slice(0, 10)

  return {
    totalIncome: currentMonthIncome,
    totalExpenses: currentMonthExpenses,
    balance: currentMonthIncome - currentMonthExpenses,
    netWorth: totalAssets - totalDebt,
    totalDebt,
    totalAssets,
    expensesByCategory,
    recentTransactions,
    monthlyComparison: {
      currentMonthIncome,
      currentMonthExpenses,
      previousMonthIncome,
      previousMonthExpenses
    }
  }
})
