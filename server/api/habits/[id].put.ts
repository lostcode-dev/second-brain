import { z } from 'zod'
import { getSupabaseAdminClient } from '../../utils/supabase'
import { requireAuthUser } from '../../utils/require-auth'

const paramsSchema = z.object({
  id: z.string().uuid()
})

const bodySchema = z.object({
  name: z.string().min(1).max(200).optional(),
  description: z.string().max(1000).nullable().optional(),
  frequency: z.enum(['daily', 'weekly', 'custom']).optional(),
  difficulty: z.enum(['tiny', 'normal', 'hard']).optional(),
  identityId: z.string().uuid().nullable().optional(),
  customDays: z.array(z.number().int().min(0).max(6)).optional()
})

export default eventHandler(async (event) => {
  const user = await requireAuthUser(event)
  const { id } = paramsSchema.parse(getRouterParams(event))
  const body = await readBody(event)
  const parsed = bodySchema.parse(body)

  const supabase = getSupabaseAdminClient()

  const updateData: Record<string, unknown> = { updated_at: new Date().toISOString() }

  if (parsed.name !== undefined) updateData.name = parsed.name
  if (parsed.description !== undefined) updateData.description = parsed.description
  if (parsed.frequency !== undefined) updateData.frequency = parsed.frequency
  if (parsed.difficulty !== undefined) updateData.difficulty = parsed.difficulty
  if (parsed.identityId !== undefined) updateData.identity_id = parsed.identityId
  if (parsed.customDays !== undefined) updateData.custom_days = parsed.customDays

  const { data, error } = await supabase
    .from('habits')
    .update(updateData)
    .eq('id', id)
    .eq('user_id', user.id)
    .select('*, identity:identities(*), streak:habit_streaks(*)')
    .single()

  if (error || !data) {
    throw createError({ statusCode: 500, statusMessage: 'Falha ao atualizar hábito', data: error?.message })
  }

  return data
})
