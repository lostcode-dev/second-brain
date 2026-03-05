import { z } from 'zod'
import { getSupabaseAdminClient } from '../../utils/supabase'
import { requireAuthUser } from '../../utils/require-auth'

const bodySchema = z.object({
  weekKey: z.string().regex(/^\d{4}-W\d{2}$/, 'Formato deve ser YYYY-Wnn'),
  wins: z.string().max(2000).optional(),
  improvements: z.string().max(2000).optional()
})

export default eventHandler(async (event) => {
  const user = await requireAuthUser(event)
  const body = await readBody(event)
  const parsed = bodySchema.parse(body)

  const supabase = getSupabaseAdminClient()

  const { data, error } = await supabase
    .from('habit_reflections')
    .upsert(
      {
        user_id: user.id,
        week_key: parsed.weekKey,
        wins: parsed.wins ?? null,
        improvements: parsed.improvements ?? null,
        updated_at: new Date().toISOString()
      },
      { onConflict: 'user_id,week_key' }
    )
    .select('*')
    .single()

  if (error) {
    throw createError({ statusCode: 500, statusMessage: 'Falha ao salvar reflexão', data: error.message })
  }

  return data
})
