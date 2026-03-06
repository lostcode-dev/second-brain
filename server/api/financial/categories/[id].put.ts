import { z } from 'zod'
import { getSupabaseAdminClient } from '../../../utils/supabase'
import { requireAuthUser } from '../../../utils/require-auth'

const bodySchema = z.object({
  name: z.string().min(1).max(100).optional(),
  icon: z.string().max(100).optional(),
  color: z.string().max(50).optional()
})

export default eventHandler(async (event) => {
  const user = await requireAuthUser(event)
  const id = getRouterParam(event, 'id')

  if (!id || !z.string().uuid().safeParse(id).success) {
    throw createError({ statusCode: 400, statusMessage: 'ID inválido' })
  }

  const body = await readBody(event)
  const parsed = bodySchema.parse(body)
  const supabase = getSupabaseAdminClient()

  const updates: Record<string, unknown> = {}
  if (parsed.name !== undefined) updates.name = parsed.name
  if (parsed.icon !== undefined) updates.icon = parsed.icon
  if (parsed.color !== undefined) updates.color = parsed.color

  if (Object.keys(updates).length === 0) {
    throw createError({ statusCode: 400, statusMessage: 'Nenhum campo para atualizar' })
  }

  const { data, error } = await supabase
    .from('financial_categories')
    .update(updates)
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single()

  if (error) {
    throw createError({ statusCode: 500, statusMessage: 'Erro ao atualizar categoria', data: error.message })
  }

  return {
    id: data.id,
    userId: data.user_id,
    name: data.name,
    icon: data.icon,
    color: data.color,
    type: data.type,
    createdAt: data.created_at
  }
})
