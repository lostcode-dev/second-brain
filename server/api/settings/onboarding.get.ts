import { requireAuthUser } from '../../utils/require-auth'
import { getSupabaseAdminClient } from '../../utils/supabase'
import { getDefaultOnboardingState, parseOnboardingState } from '../../utils/onboarding'

export default eventHandler(async (event) => {
  const user = await requireAuthUser(event)
  const supabase = getSupabaseAdminClient()

  const { data, error } = await supabase
    .from('user_preferences')
    .select('onboarding_state, timezone')
    .eq('user_id', user.id)
    .single()

  if (error && error.code !== 'PGRST116') {
    throw createError({
      statusCode: 500,
      statusMessage: 'Não foi possível carregar o onboarding'
    })
  }

  return {
    onboarding: data ? parseOnboardingState(data.onboarding_state) : getDefaultOnboardingState(),
    timezone: data?.timezone ?? 'UTC'
  }
})
