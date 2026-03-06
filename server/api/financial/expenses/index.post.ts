import { z } from 'zod'
import { getSupabaseAdminClient } from '../../../utils/supabase'
import { requireAuthUser } from '../../../utils/require-auth'

const bodySchema = z.object({
  description: z.string().min(1).max(200),
  amount: z.number().positive(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  recurring: z.boolean().default(false),
  recurringDay: z.number().int().min(1).max(31).optional(),
  categoryId: z.string().uuid().optional()
})

export default eventHandler(async (event) => {
  const user = await requireAuthUser(event)
  const body = await readBody(event)
  const parsed = bodySchema.parse(body)
  const supabase = getSupabaseAdminClient()

  const { data, error } = await supabase
    .from('expenses')
    .insert({
      user_id: user.id,
      description: parsed.description,
      amount: parsed.amount,
      date: parsed.date,
      recurring: parsed.recurring,
      recurring_day: parsed.recurringDay ?? null,
      category_id: parsed.categoryId ?? null
    })
    .select('*, category:financial_categories(*)')
    .single()

  if (error) {
    throw createError({ statusCode: 500, statusMessage: 'Erro ao criar despesa', data: error.message })
  }

  return {
    id: data.id,
    userId: data.user_id,
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
