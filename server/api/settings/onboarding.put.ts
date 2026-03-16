import { requireAuthUser } from '../../utils/require-auth'
import { getSupabaseAdminClient } from '../../utils/supabase'
import {
  getDefaultOnboardingState,
  mergeOnboardingState,
  onboardingUpdateSchema,
  parseOnboardingState
} from '../../utils/onboarding'

export default eventHandler(async (event) => {
  const user = await requireAuthUser(event)
  const body = await readBody(event)
  const parsed = onboardingUpdateSchema.safeParse(body)

  if (!parsed.success) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Dados inválidos',
      data: parsed.error.flatten()
    })
  }

  const supabase = getSupabaseAdminClient()

  const { data: existing, error: loadError } = await supabase
    .from('user_preferences')
    .select('onboarding_state, timezone')
    .eq('user_id', user.id)
    .single()

  if (loadError && loadError.code !== 'PGRST116') {
    throw createError({
      statusCode: 500,
      statusMessage: 'Não foi possível carregar o onboarding'
    })
  }

  const currentOnboarding = existing
    ? parseOnboardingState(existing.onboarding_state)
    : getDefaultOnboardingState()
  const nextOnboarding = mergeOnboardingState(currentOnboarding, parsed.data)
  const timezone = parsed.data.timezone ?? existing?.timezone ?? 'UTC'

  const { error } = await supabase
    .from('user_preferences')
    .upsert({
      user_id: user.id,
      onboarding_state: nextOnboarding,
      timezone
    }, { onConflict: 'user_id' })

  if (error) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Não foi possível salvar o onboarding'
    })
  }

  return {
    onboarding: nextOnboarding,
    timezone
  }
})
