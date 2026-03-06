import { z } from 'zod'
import { getSupabaseAdminClient } from '../../../utils/supabase'
import { requireAuthUser } from '../../../utils/require-auth'

const bodySchema = z.object({
  name: z.string().min(1).max(100),
  icon: z.string().max(100).optional(),
  color: z.string().max(50).optional(),
  type: z.enum(['income', 'expense'])
})

export default eventHandler(async (event) => {
  const user = await requireAuthUser(event)
  const body = await readBody(event)
  const parsed = bodySchema.parse(body)
  const supabase = getSupabaseAdminClient()

  const { data, error } = await supabase
    .from('financial_categories')
    .insert({
      user_id: user.id,
      name: parsed.name,
      icon: parsed.icon ?? null,
      color: parsed.color ?? null,
      type: parsed.type
    })
    .select()
    .single()

  if (error) {
    throw createError({ statusCode: 500, statusMessage: 'Erro ao criar categoria', data: error.message })
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
