import { requireAuthUser } from '../../utils/require-auth'
import { getSupabaseAdminClient } from '../../utils/supabase'
import type { GuidedTourRegistry } from '~/types/guided-tour'

function parseGuidedTours(value: unknown): GuidedTourRegistry {
  if (!value || typeof value !== 'object' || Array.isArray(value))
    return {}

  return Object.fromEntries(
    Object.entries(value).filter(([, entry]) => {
      if (!entry || typeof entry !== 'object' || Array.isArray(entry))
        return false

      const maybeEntry = entry as Partial<{ completed: boolean, completedAt: string | null }>
      return typeof maybeEntry.completed === 'boolean'
    })
  ) as GuidedTourRegistry
}

export default eventHandler(async (event) => {
  const user = await requireAuthUser(event)
  const supabase = getSupabaseAdminClient()

  const { data, error } = await supabase
    .from('user_preferences')
    .select('guided_tours')
    .eq('user_id', user.id)
    .single()

  if (error && error.code !== 'PGRST116') {
    throw createError({
      statusCode: 500,
      statusMessage: 'Could not load guided tours'
    })
  }

  return {
    tours: parseGuidedTours(data?.guided_tours)
  }
})
