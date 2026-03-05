import { z } from 'zod'
import { getSupabaseAdminClient } from '../../../utils/supabase'
import { requireAuthUser } from '../../../utils/require-auth'

const bodySchema = z.object({
  title: z.string().min(1).max(200).optional(),
  description: z.string().max(2000).nullable().optional(),
  location: z.string().max(500).nullable().optional(),
  startAt: z.string().datetime().optional(),
  endAt: z.string().datetime().optional(),
  eventTimezone: z.string().min(1).max(100).optional(),
  allDay: z.boolean().optional(),
  rrule: z.string().max(500).nullable().optional(),
  calendarId: z.string().uuid().optional()
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

  const updateData: Record<string, unknown> = {
    updated_at: new Date().toISOString()
  }

  if (payload.title !== undefined) updateData.title = payload.title
  if (payload.description !== undefined) updateData.description = payload.description
  if (payload.location !== undefined) updateData.location = payload.location
  if (payload.startAt !== undefined) updateData.start_at = payload.startAt
  if (payload.endAt !== undefined) updateData.end_at = payload.endAt
  if (payload.eventTimezone !== undefined) updateData.event_timezone = payload.eventTimezone
  if (payload.allDay !== undefined) updateData.all_day = payload.allDay
  if (payload.rrule !== undefined) updateData.rrule = payload.rrule
  if (payload.calendarId !== undefined) updateData.calendar_id = payload.calendarId

  const { data, error } = await supabase
    .from('events')
    .update(updateData)
    .eq('id', id)
    .eq('owner_user_id', user.id)
    .select()
    .single()

  if (error || !data) {
    throw createError({ statusCode: 404, statusMessage: 'Evento não encontrado' })
  }

  return data
})
