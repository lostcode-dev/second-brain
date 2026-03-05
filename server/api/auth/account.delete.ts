import { requireAuthUser } from '../../utils/require-auth'
import { getSupabaseAdminClient } from '../../utils/supabase'
import { clearAuthCookies } from '../../utils/auth-cookies'
import { clearAuthUserCookie } from '../../utils/auth-user'

export default eventHandler(async (event) => {
  const user = await requireAuthUser(event)
  const supabase = getSupabaseAdminClient()

  const { error } = await supabase.auth.admin.deleteUser(user.id)

  if (error) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Não foi possível excluir a conta'
    })
  }

  clearAuthCookies(event)
  clearAuthUserCookie(event)

  return { ok: true }
})
