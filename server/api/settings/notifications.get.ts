import { requireAuthUser } from '../../utils/require-auth'
import { getSupabaseAdminClient } from '../../utils/supabase'

export default eventHandler(async (event) => {
  const user = await requireAuthUser(event)
  const supabase = getSupabaseAdminClient()

  const { data, error } = await supabase
    .from('notification_preferences')
    .select('*')
    .eq('user_id', user.id)
    .single()

  if (error && error.code !== 'PGRST116') {
    throw createError({
      statusCode: 500,
      statusMessage: 'Não foi possível carregar as preferências'
    })
  }

  // Return defaults if no record exists
  if (!data) {
    return {
      channel_email: true,
      channel_desktop: false,
      digest_weekly: false,
      product_updates: true,
      important_updates: true
    }
  }

  return {
    channel_email: data.channel_email,
    channel_desktop: data.channel_desktop,
    digest_weekly: data.digest_weekly,
    product_updates: data.product_updates,
    important_updates: data.important_updates
  }
})
