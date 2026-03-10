import { getSupabaseAdminClient } from '../../../../utils/supabase'
import { requireAuthUser } from '../../../../utils/require-auth'

export default eventHandler(async (event) => {
  const user = await requireAuthUser(event)
  const id = getRouterParam(event, 'id')

  if (!id) {
    throw createError({ statusCode: 400, statusMessage: 'ID do evento é obrigatório' })
  }

  const supabase = getSupabaseAdminClient()

  // Fetch current state for history
  const { data: currentEvent } = await supabase
    .from('events')
    .select('*')
    .eq('id', id)
    .eq('owner_user_id', user.id)
    .is('archived_at', null)
    .single()

  if (!currentEvent) {
    throw createError({ statusCode: 404, statusMessage: 'Evento não encontrado' })
  }

  // Save snapshot to history
  const current = currentEvent as Record<string, unknown>
  await supabase.from('event_history').insert({
    event_id: id,
    changed_by: user.id,
    title: current.title,
    description: current.description,
    location: current.location,
    start_at: current.start_at,
    end_at: current.end_at,
    event_timezone: current.event_timezone,
    all_day: current.all_day,
    rrule: current.rrule,
    calendar_id: current.calendar_id,
    change_type: 'archive'
  })

  const { data, error } = await supabase
    .from('events')
    .update({
      archived_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    })
    .eq('id', id)
    .eq('owner_user_id', user.id)
    .is('archived_at', null)
    .select()
    .single()

  if (error || !data) {
    throw createError({ statusCode: 404, statusMessage: 'Evento não encontrado' })
  }

  return data
})
