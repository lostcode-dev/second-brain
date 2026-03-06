import { z } from 'zod'
import { getSupabaseAdminClient } from '../../../utils/supabase'
import { requireAuthUser } from '../../../utils/require-auth'

const bodySchema = z.object({
  amount: z.number().positive(),
  dueDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/)
})

export default eventHandler(async (event) => {
  const user = await requireAuthUser(event)
  const debtId = getRouterParam(event, 'id')

  if (!debtId || !z.string().uuid().safeParse(debtId).success) {
    throw createError({ statusCode: 400, statusMessage: 'ID inválido' })
  }

  const body = await readBody(event)
  const parsed = bodySchema.parse(body)
  const supabase = getSupabaseAdminClient()

  // Verify debt ownership
  const { data: debt, error: debtError } = await supabase
    .from('debts')
    .select('id, user_id')
    .eq('id', debtId)
    .eq('user_id', user.id)
    .single()

  if (debtError || !debt) {
    throw createError({ statusCode: 404, statusMessage: 'Dívida não encontrada' })
  }

  const { data, error } = await supabase
    .from('debt_installments')
    .insert({
      debt_id: debtId,
      amount: parsed.amount,
      due_date: parsed.dueDate,
      paid: false
    })
    .select()
    .single()

  if (error) {
    throw createError({ statusCode: 500, statusMessage: 'Erro ao criar parcela', data: error.message })
  }

  return {
    id: data.id,
    debtId: data.debt_id,
    amount: Number(data.amount),
    dueDate: data.due_date,
    paid: data.paid,
    paidAt: data.paid_at ?? null,
    createdAt: data.created_at
  }
})
