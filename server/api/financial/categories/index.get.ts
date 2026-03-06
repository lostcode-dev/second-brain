import { z } from 'zod'
import { getSupabaseAdminClient } from '../../../utils/supabase'
import { requireAuthUser } from '../../../utils/require-auth'

export default eventHandler(async (event) => {
  const user = await requireAuthUser(event)
  const supabase = getSupabaseAdminClient()

  const query = getQuery(event)
  const type = z.enum(['income', 'expense']).optional().parse(query.type)

  let qb = supabase
    .from('financial_categories')
    .select('*')
    .eq('user_id', user.id)
    .order('name', { ascending: true })

  if (type) {
    qb = qb.eq('type', type)
  }

  const { data, error } = await qb

  if (error) {
    throw createError({ statusCode: 500, statusMessage: 'Erro ao buscar categorias', data: error.message })
  }

  return (data ?? []).map((c: Record<string, unknown>) => ({
    id: c.id,
    userId: c.user_id,
    name: c.name,
    icon: c.icon ?? null,
    color: c.color ?? null,
    type: c.type,
    createdAt: c.created_at
  }))
})
