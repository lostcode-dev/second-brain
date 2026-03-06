import { z } from 'zod'
import { getSupabaseAdminClient } from '../../../../utils/supabase'
import { requireAuthUser } from '../../../../utils/require-auth'

export default eventHandler(async (event) => {
  const user = await requireAuthUser(event)
  const installmentId = getRouterParam(event, 'installmentId')

  if (!installmentId || !z.string().uuid().safeParse(installmentId).success) {
    throw createError({ statusCode: 400, statusMessage: 'ID inválido' })
  }

  const supabase = getSupabaseAdminClient()

  // Get the installment and verify ownership via debt
  const { data: installment, error: fetchError } = await supabase
    .from('debt_installments')
    .select('*, debt:debts(user_id)')
    .eq('id', installmentId)
    .single()

  if (fetchError || !installment) {
    throw createError({ statusCode: 404, statusMessage: 'Parcela não encontrada' })
  }

  const debtOwner = (installment.debt as Record<string, unknown>)?.user_id
  if (debtOwner !== user.id) {
    throw createError({ statusCode: 403, statusMessage: 'Sem permissão' })
  }

  const nowPaid = !installment.paid

  // Update installment
  const { data: updated, error: updateError } = await supabase
    .from('debt_installments')
    .update({
      paid: nowPaid,
      paid_at: nowPaid ? new Date().toISOString() : null
    })
    .eq('id', installmentId)
    .select()
    .single()

  if (updateError) {
    throw createError({ statusCode: 500, statusMessage: 'Erro ao atualizar parcela', data: updateError.message })
  }

  // Recalculate remaining amount on debt
  const debtId = installment.debt_id as string

  const { data: allInstallments } = await supabase
    .from('debt_installments')
    .select('amount, paid')
    .eq('debt_id', debtId)

  const paidTotal = (allInstallments ?? [])
    .filter((i: Record<string, unknown>) => i.paid)
    .reduce((sum: number, i: Record<string, unknown>) => sum + Number(i.amount), 0)

  const { data: debt } = await supabase
    .from('debts')
    .select('total_amount')
    .eq('id', debtId)
    .single()

  const totalAmount = Number(debt?.total_amount ?? 0)
  const remaining = Math.max(0, totalAmount - paidTotal)
  const allPaid = (allInstallments ?? []).every((i: Record<string, unknown>) => i.paid)

  await supabase
    .from('debts')
    .update({
      remaining_amount: remaining,
      status: allPaid && (allInstallments ?? []).length > 0 ? 'paid_off' : 'active',
      updated_at: new Date().toISOString()
    })
    .eq('id', debtId)

  return {
    id: updated.id,
    debtId: updated.debt_id,
    amount: Number(updated.amount),
    dueDate: updated.due_date,
    paid: updated.paid,
    paidAt: updated.paid_at ?? null,
    createdAt: updated.created_at
  }
})
