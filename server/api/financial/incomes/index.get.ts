import { z } from 'zod'
import { getSupabaseAdminClient } from '../../../utils/supabase'
import { requireAuthUser } from '../../../utils/require-auth'

const querySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
  search: z.string().max(200).optional(),
  categoryId: z.string().uuid().optional(),
  recurring: z.preprocess((v) => {
    if (v === undefined) return undefined
    if (typeof v === 'boolean') return v
    if (typeof v === 'string') {
      if (['true', '1'].includes(v.toLowerCase())) return true
      if (['false', '0'].includes(v.toLowerCase())) return false
    }
    return undefined
  }, z.boolean().optional()),
  dateFrom: z.string().optional(),
  dateTo: z.string().optional()
})

export default eventHandler(async (event) => {
  const user = await requireAuthUser(event)
  const query = getQuery(event)
  const params = querySchema.parse(query)
  const supabase = getSupabaseAdminClient()

  const from = (params.page - 1) * params.pageSize
  const to = from + params.pageSize - 1

  let qb = supabase
    .from('incomes')
    .select('*, category:financial_categories(*)', { count: 'exact' })
    .eq('user_id', user.id)
    .order('date', { ascending: false })
    .range(from, to)

  if (params.search) {
    qb = qb.ilike('source', `%${params.search}%`)
  }

  if (params.categoryId) {
    qb = qb.eq('category_id', params.categoryId)
  }

  if (params.recurring !== undefined) {
    qb = qb.eq('recurring', params.recurring)
  }

  if (params.dateFrom) {
    qb = qb.gte('date', params.dateFrom)
  }

  if (params.dateTo) {
    qb = qb.lte('date', params.dateTo)
  }

  const { data, error, count } = await qb

  if (error) {
    throw createError({ statusCode: 500, statusMessage: 'Erro ao buscar receitas', data: error.message })
  }

  const mapped = (data ?? []).map((row: Record<string, unknown>) => ({
    id: row.id,
    userId: row.user_id,
    source: row.source,
    description: row.description ?? null,
    amount: Number(row.amount),
    date: row.date,
    recurring: row.recurring ?? false,
    recurringDay: row.recurring_day ?? null,
    categoryId: row.category_id ?? null,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    category: row.category
      ? {
          id: (row.category as Record<string, unknown>).id,
          userId: (row.category as Record<string, unknown>).user_id,
          name: (row.category as Record<string, unknown>).name,
          icon: (row.category as Record<string, unknown>).icon ?? null,
          color: (row.category as Record<string, unknown>).color ?? null,
          type: (row.category as Record<string, unknown>).type,
          createdAt: (row.category as Record<string, unknown>).created_at
        }
      : null
  }))

  return {
    data: mapped,
    total: count ?? 0,
    page: params.page,
    pageSize: params.pageSize
  }
})
