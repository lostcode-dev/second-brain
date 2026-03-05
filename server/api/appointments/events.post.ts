import { z } from 'zod'
import { getSupabaseAdminClient } from '../../utils/supabase'
import { requireAuthUser } from '../../utils/require-auth'

const reminderSchema = z.object({
  type: z.enum(['popup', 'email', 'push']).default('popup'),
  minutesBefore: z.number().int().min(0).max(10080) // max 1 week
})

const bodySchema = z.object({
  calendarId: z.string().uuid(),
  title: z.string().min(1).max(200),
  description: z.string().max(2000).optional(),
  location: z.string().max(500).optional(),
  startAt: z.string().datetime(),
  endAt: z.string().datetime(),
  eventTimezone: z.string().min(1).max(100),
  allDay: z.boolean().default(false),
  rrule: z.string().max(500).optional(),
  reminders: z.array(reminderSchema).max(5).optional()
})

export default eventHandler(async (event) => {
  const user = await requireAuthUser(event)
  const body = await readBody(event)
  const payload = bodySchema.parse(body)

  // Validate end > start
  if (new Date(payload.endAt) <= new Date(payload.startAt)) {
    throw createError({
      statusCode: 400,
      statusMessage: 'A data de término deve ser posterior à data de início'
    })
  }

  const supabase = getSupabaseAdminClient()

  // Verify calendar ownership
  const { data: calendar, error: calError } = await supabase
    .from('calendars')
    .select('id')
    .eq('id', payload.calendarId)
    .eq('owner_user_id', user.id)
    .is('archived_at', null)
    .single()

  if (calError || !calendar) {
    throw createError({ statusCode: 404, statusMessage: 'Calendário não encontrado' })
  }

  // Insert event
  const { data: newEvent, error: eventError } = await supabase
    .from('events')
    .insert({
      calendar_id: payload.calendarId,
      owner_user_id: user.id,
      title: payload.title,
      description: payload.description ?? null,
      location: payload.location ?? null,
      start_at: payload.startAt,
      end_at: payload.endAt,
      event_timezone: payload.eventTimezone,
      all_day: payload.allDay,
      rrule: payload.rrule ?? null
    })
    .select()
    .single()

  if (eventError || !newEvent) {
    throw createError({ statusCode: 500, statusMessage: eventError?.message ?? 'Erro ao criar evento' })
  }

  // Insert reminders if provided
  const eventObj = newEvent as Record<string, unknown>
  if (payload.reminders && payload.reminders.length > 0) {
    const reminderRows = payload.reminders.map(r => ({
      event_id: eventObj.id as string,
      user_id: user.id,
      type: r.type,
      minutes_before: r.minutesBefore
    }))

    await supabase.from('event_reminders').insert(reminderRows)
  }

  setResponseStatus(event, 201)
  return newEvent
})
