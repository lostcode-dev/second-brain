import { z } from 'zod'
import { getSupabaseAdminClient } from '../../../../utils/supabase'
import { requireAuthUser } from '../../../../utils/require-auth'

const bodySchema = z.object({
  recurrenceId: z.string().min(1)
})

export default eventHandler(async (event) => {
  const user = await requireAuthUser(event)
  const id = getRouterParam(event, 'id')

  if (!id) {
    throw createError({ statusCode: 400, statusMessage: 'ID do evento é obrigatório' })
  }

  const body = await readBody(event)
  const payload = bodySchema.parse(body)

  const supabase = getSupabaseAdminClient()

  // Verify event ownership and that it's recurring
  const { data: eventData, error: eventError } = await supabase
    .from('events')
    .select('id, rrule')
    .eq('id', id)
    .eq('owner_user_id', user.id)
    .single()

  if (eventError || !eventData) {
    throw createError({ statusCode: 404, statusMessage: 'Evento não encontrado' })
  }

  const evtObj = eventData as Record<string, unknown>
  if (!evtObj.rrule) {
    throw createError({ statusCode: 400, statusMessage: 'Este evento não é recorrente' })
  }

  // Create cancelled exception
  const { data, error } = await supabase
    .from('event_exceptions')
    .upsert(
      {
        event_id: id,
        type: 'cancelled',
        recurrence_id: payload.recurrenceId
      },
      { onConflict: 'event_id,recurrence_id' }
    )
    .select()
    .single()

  if (error) {
    throw createError({ statusCode: 500, statusMessage: error.message })
  }

  return data
})
