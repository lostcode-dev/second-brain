import { z } from 'zod'
import { getSupabaseAdminClient } from '../../../utils/supabase'
import { requireAuthUser } from '../../../utils/require-auth'

const bodySchema = z.object({
  source: z.string().min(1).max(200).optional(),
  description: z.string().max(500).optional(),
  amount: z.number().positive().optional(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  recurring: z.boolean().optional(),
  recurringDay: z.number().int().min(1).max(31).nullable().optional(),
  categoryId: z.string().uuid().nullable().optional()
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
  if (parsed.source !== undefined) updates.source = parsed.source
  if (parsed.description !== undefined) updates.description = parsed.description
  if (parsed.amount !== undefined) updates.amount = parsed.amount
  if (parsed.date !== undefined) updates.date = parsed.date
  if (parsed.recurring !== undefined) updates.recurring = parsed.recurring
  if (parsed.recurringDay !== undefined) updates.recurring_day = parsed.recurringDay
  if (parsed.categoryId !== undefined) updates.category_id = parsed.categoryId

  const { data, error } = await supabase
    .from('incomes')
    .update(updates)
    .eq('id', id)
    .eq('user_id', user.id)
    .select('*, category:financial_categories(*)')
    .single()

  if (error) {
    throw createError({ statusCode: 500, statusMessage: 'Erro ao atualizar receita', data: error.message })
  }

  return {
    id: data.id,
    userId: data.user_id,
    source: data.source,
    description: data.description,
    amount: Number(data.amount),
    date: data.date,
    recurring: data.recurring,
    recurringDay: data.recurring_day,
    categoryId: data.category_id,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
    category: data.category ?? null
  }
})
