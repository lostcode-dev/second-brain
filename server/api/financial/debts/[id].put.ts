import { z } from 'zod'
import { getSupabaseAdminClient } from '../../../utils/supabase'
import { requireAuthUser } from '../../../utils/require-auth'

const bodySchema = z.object({
  name: z.string().min(1).max(200).optional(),
  description: z.string().max(500).optional(),
  totalAmount: z.number().positive().optional()
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

  const updates: Record<string, unknown> = { updated_at: new Date().toISOString() }
  if (parsed.name !== undefined) updates.name = parsed.name
  if (parsed.description !== undefined) updates.description = parsed.description
  if (parsed.totalAmount !== undefined) updates.total_amount = parsed.totalAmount

  const { data, error } = await supabase
    .from('debts')
    .update(updates)
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single()

  if (error) {
    throw createError({ statusCode: 500, statusMessage: 'Erro ao atualizar dívida', data: error.message })
  }

  return {
    id: data.id,
    userId: data.user_id,
    name: data.name,
    description: data.description,
    totalAmount: Number(data.total_amount),
    remainingAmount: Number(data.remaining_amount),
    status: data.status,
    createdAt: data.created_at,
    updatedAt: data.updated_at
  }
})
