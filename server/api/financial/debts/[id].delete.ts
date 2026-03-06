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

  // Verify ownership
  const { data: debt, error: fetchError } = await supabase
    .from('debts')
    .select('id')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (fetchError || !debt) {
    throw createError({ statusCode: 404, statusMessage: 'Dívida não encontrada' })
  }

  // Delete installments first (cascade should handle, but explicit)
  await supabase.from('debt_installments').delete().eq('debt_id', id)

  const { error } = await supabase
    .from('debts')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) {
    throw createError({ statusCode: 500, statusMessage: 'Erro ao excluir dívida', data: error.message })
  }

  return { success: true }
})
