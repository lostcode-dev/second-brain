import { z } from 'zod'
import { requireAuthUser } from '../../utils/require-auth'
import { getSupabaseAdminClient } from '../../utils/supabase'
import type { GuidedTourEntry, GuidedTourRegistry } from '~/types/guided-tour'

const schema = z.object({
  completed: z.boolean().default(true),
  key: z.string().trim().min(1).max(120).regex(/^[a-z0-9._-]+$/i, 'Invalid guided tour key')
})

function parseGuidedTours(value: unknown): GuidedTourRegistry {
  if (!value || typeof value !== 'object' || Array.isArray(value))
    return {}

  return Object.fromEntries(
    Object.entries(value).filter(([, entry]) => {
      if (!entry || typeof entry !== 'object' || Array.isArray(entry))
        return false

      const maybeEntry = entry as Partial<GuidedTourEntry>
      return typeof maybeEntry.completed === 'boolean'
    })
  ) as GuidedTourRegistry
}

export default eventHandler(async (event) => {
  const user = await requireAuthUser(event)
  const body = await readBody(event)
  const parsed = schema.safeParse(body)

  if (!parsed.success) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Invalid guided tour payload',
      data: parsed.error.flatten()
    })
  }

  const supabase = getSupabaseAdminClient()
  const { data: existing, error: existingError } = await supabase
    .from('user_preferences')
    .select('guided_tours')
    .eq('user_id', user.id)
    .single()

  if (existingError && existingError.code !== 'PGRST116') {
    throw createError({
      statusCode: 500,
      statusMessage: 'Could not load guided tours'
    })
  }

  const tours = parseGuidedTours(existing?.guided_tours)
  const nextTours: GuidedTourRegistry = {
    ...tours,
    [parsed.data.key]: {
      completed: parsed.data.completed,
      completedAt: parsed.data.completed ? new Date().toISOString() : null
    }
  }

  const { error } = await supabase
    .from('user_preferences')
    .upsert({
      guided_tours: nextTours,
      user_id: user.id
    }, { onConflict: 'user_id' })

  if (error) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Could not save guided tour state'
    })
  }

  return {
    tours: nextTours
  }
})
