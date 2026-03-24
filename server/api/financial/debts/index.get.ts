import { z } from 'zod'
import { getSupabaseAdminClient } from '../../../utils/supabase'
import { requireAuthUser } from '../../../utils/require-auth'

const querySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
  status: z.enum(['active', 'paid_off']).optional(),
  search: z.string().max(200).optional()
})

export default eventHandler(async (event) => {
  const user = await requireAuthUser(event)
  const query = getQuery(event)
  const params = querySchema.parse(query)
  const supabase = getSupabaseAdminClient()

  const from = (params.page - 1) * params.pageSize
  const to = from + params.pageSize - 1

  let qb = supabase
    .from('debts')
    .select('*', { count: 'exact' })
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .range(from, to)

  if (params.status) {
    qb = qb.eq('status', params.status)
  }

  if (params.search) {
    qb = qb.ilike('name', `%${params.search}%`)
  }

  const { data, error, count } = await qb

  if (error) {
    throw createError({ statusCode: 500, statusMessage: 'Erro ao buscar dívidas', data: error.message })
  }

  // Fetch installment counts for each debt
  const debtIds = (data ?? []).map((d: Record<string, unknown>) => d.id as string)

  const installmentCounts: Record<string, { total: number, paid: number }> = {}

  if (debtIds.length > 0) {
    const { data: installments } = await supabase
      .from('debt_installments')
      .select('debt_id, paid')
      .in('debt_id', debtIds)

    if (installments) {
      for (const inst of installments) {
        const dId = inst.debt_id as string
        if (!installmentCounts[dId]) {
          installmentCounts[dId] = { total: 0, paid: 0 }
        }
        installmentCounts[dId]!.total++
        if (inst.paid) installmentCounts[dId]!.paid++
      }
    }
  }

  const mapped = (data ?? []).map((row: Record<string, unknown>) => ({
    id: row.id,
    userId: row.user_id,
    name: row.name,
    description: row.description ?? null,
    totalAmount: Number(row.total_amount),
    remainingAmount: Number(row.remaining_amount),
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    installmentCount: installmentCounts[row.id as string]?.total ?? 0,
    paidInstallmentCount: installmentCounts[row.id as string]?.paid ?? 0
  }))

  return {
    data: mapped,
    total: count ?? 0,
    page: params.page,
    pageSize: params.pageSize
  }
})
