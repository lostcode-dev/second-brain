import { z } from 'zod'
import { getSupabaseAdminClient } from '../../../utils/supabase'
import { requireAuthUser } from '../../../utils/require-auth'

const bodySchema = z.object({
  name: z.string().min(1).max(200),
  description: z.string().max(500).optional(),
  value: z.number().min(0)
})

export default eventHandler(async (event) => {
  const user = await requireAuthUser(event)
  const body = await readBody(event)
  const parsed = bodySchema.parse(body)
  const supabase = getSupabaseAdminClient()

  const { data, error } = await supabase
    .from('assets')
    .insert({
      user_id: user.id,
      name: parsed.name,
      description: parsed.description ?? null,
      value: parsed.value
    })
    .select()
    .single()

  if (error) {
    throw createError({ statusCode: 500, statusMessage: 'Erro ao criar ativo', data: error.message })
  }

  return {
    id: data.id,
    userId: data.user_id,
    name: data.name,
    description: data.description,
    value: Number(data.value),
    createdAt: data.created_at,
    updatedAt: data.updated_at
  }
})
