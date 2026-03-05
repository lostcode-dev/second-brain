import { z } from 'zod'
import { getSupabaseAdminClient } from '../../utils/supabase'
import { requireAuthUser } from '../../utils/require-auth'

const querySchema = z.object({
  weekKey: z.string().regex(/^\d{4}-W\d{2}$/, 'Formato deve ser YYYY-Wnn').optional()
})

export default eventHandler(async (event) => {
  const user = await requireAuthUser(event)
  const query = getQuery(event)
  const params = querySchema.parse(query)

  const supabase = getSupabaseAdminClient()

  if (params.weekKey) {
    // Get specific reflection
    const { data, error } = await supabase
      .from('habit_reflections')
      .select('*')
      .eq('user_id', user.id)
      .eq('week_key', params.weekKey)
      .single()

    if (error && error.code !== 'PGRST116') {
      throw createError({ statusCode: 500, statusMessage: 'Falha ao buscar reflexão', data: error.message })
    }

    return data ?? null
  }

  // Get all reflections paginated
  const { data, error } = await supabase
    .from('habit_reflections')
    .select('*')
    .eq('user_id', user.id)
    .order('week_key', { ascending: false })
    .limit(12)

  if (error) {
    throw createError({ statusCode: 500, statusMessage: 'Falha ao buscar reflexões', data: error.message })
  }

  return data ?? []
})
