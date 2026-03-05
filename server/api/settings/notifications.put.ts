import { z } from 'zod'
import { requireAuthUser } from '../../utils/require-auth'
import { getSupabaseAdminClient } from '../../utils/supabase'

const schema = z.object({
  channel_email: z.boolean(),
  channel_desktop: z.boolean(),
  digest_weekly: z.boolean(),
  product_updates: z.boolean(),
  important_updates: z.boolean()
})

export default eventHandler(async (event) => {
  const user = await requireAuthUser(event)
  const body = await readBody(event)
  const parsed = schema.safeParse(body)

  if (!parsed.success) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Dados inválidos',
      data: parsed.error.flatten()
    })
  }

  const supabase = getSupabaseAdminClient()

  const { error } = await supabase
    .from('notification_preferences')
    .upsert({
      user_id: user.id,
      channel_email: parsed.data.channel_email,
      channel_desktop: parsed.data.channel_desktop,
      digest_weekly: parsed.data.digest_weekly,
      product_updates: parsed.data.product_updates,
      important_updates: parsed.data.important_updates
    }, { onConflict: 'user_id' })

  if (error) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Não foi possível salvar as preferências'
    })
  }

  return { ok: true }
})
