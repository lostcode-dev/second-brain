import { z } from 'zod'
import { getSupabaseAdminClient } from '../../../utils/supabase'
import { requireAuthUser } from '../../../utils/require-auth'

const querySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
  sourceType: z.enum(['habit', 'goal', 'task', 'event', 'journal_entry']).optional(),
  sourceId: z.string().uuid().optional(),
  targetType: z.enum(['habit', 'goal', 'task', 'event', 'journal_entry']).optional()
})

export default eventHandler(async (event) => {
  const user = await requireAuthUser(event)
  const query = getQuery(event)
  const params = querySchema.parse(query)

  const supabase = getSupabaseAdminClient()

  const from = (params.page - 1) * params.pageSize
  const to = from + params.pageSize - 1

  let qb = supabase
    .from('entity_links')
    .select('*', { count: 'exact' })
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .range(from, to)

  if (params.sourceType) {
    qb = qb.eq('source_type', params.sourceType)
  }

  if (params.sourceId) {
    qb = qb.eq('source_id', params.sourceId)
  }

  if (params.targetType) {
    qb = qb.eq('target_type', params.targetType)
  }

  const { data, error, count } = await qb

  if (error) {
    throw createError({ statusCode: 500, statusMessage: 'Falha ao buscar vínculos', data: error.message })
  }

  return {
    data: data ?? [],
    total: count ?? 0,
    page: params.page,
    pageSize: params.pageSize
  }
})
