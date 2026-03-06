import { z } from 'zod'
import { getSupabaseAdminClient } from '../../../utils/supabase'
import { requireAuthUser } from '../../../utils/require-auth'

export default eventHandler(async (event) => {
  const user = await requireAuthUser(event)
  const id = getRouterParam(event, 'id')

  if (!id || !z.string().uuid().safeParse(id).success) {
    throw createError({ statusCode: 400, statusMessage: 'ID inválido' })
  }

  const supabase = getSupabaseAdminClient()

  // Fetch debt with installments
  const { data: debt, error } = await supabase
    .from('debts')
    .select('*')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (error || !debt) {
    throw createError({ statusCode: 404, statusMessage: 'Dívida não encontrada' })
  }

  const { data: installments } = await supabase
    .from('debt_installments')
    .select('*')
    .eq('debt_id', id)
    .order('due_date', { ascending: true })

  return {
    id: debt.id,
    userId: debt.user_id,
    name: debt.name,
    description: debt.description,
    totalAmount: Number(debt.total_amount),
    remainingAmount: Number(debt.remaining_amount),
    status: debt.status,
    createdAt: debt.created_at,
    updatedAt: debt.updated_at,
    installments: (installments ?? []).map((i: Record<string, unknown>) => ({
      id: i.id,
      debtId: i.debt_id,
      amount: Number(i.amount),
      dueDate: i.due_date,
      paid: i.paid ?? false,
      paidAt: i.paid_at ?? null,
      createdAt: i.created_at
    }))
  }
})
