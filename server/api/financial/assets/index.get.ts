import { z } from 'zod'
import { getSupabaseAdminClient } from '../../../utils/supabase'
import { requireAuthUser } from '../../../utils/require-auth'

const querySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(50),
  search: z.string().max(200).optional()
})

export default eventHandler(async (event) => {
  const user = await requireAuthUser(event)
  const query = getQuery(event)
  const params = querySchema.parse(query)
  const supabase = getSupabaseAdminClient()

  const from = (params.page - 1) * params.pageSize
  const to = from + params.pageSize - 1

  let qb = supabase
    .from('assets')
    .select('*', { count: 'exact' })
    .eq('user_id', user.id)
    .order('name', { ascending: true })
    .range(from, to)

  if (params.search) {
    qb = qb.ilike('name', `%${params.search}%`)
  }

  const { data, error, count } = await qb

  if (error) {
    throw createError({ statusCode: 500, statusMessage: 'Erro ao buscar ativos', data: error.message })
  }

  const mapped = (data ?? []).map((row: Record<string, unknown>) => ({
    id: row.id,
    userId: row.user_id,
    name: row.name,
    description: row.description ?? null,
    value: Number(row.value),
    createdAt: row.created_at,
    updatedAt: row.updated_at
  }))

  return {
    data: mapped,
    total: count ?? 0,
    page: params.page,
    pageSize: params.pageSize
  }
})
