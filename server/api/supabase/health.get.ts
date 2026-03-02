import { getSupabaseAdminClient } from '../../utils/supabase'

export default eventHandler(async () => {
  const supabase = getSupabaseAdminClient()

  const { error } = await supabase.auth.admin.listUsers({
    page: 1,
    perPage: 1
  })

  if (error) {
    throw createError({
      statusCode: 502,
      statusMessage: 'Failed to reach Supabase',
      data: {
        code: error.code,
        message: error.message
      }
    })
  }

  return { ok: true }
})
