import { z } from 'zod'
import { requireAuthUser } from '../../utils/require-auth'
import { getSupabaseAdminClient } from '../../utils/supabase'

const schema = z.object({
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  avatar_url: z.string().url('URL inválida').optional().or(z.literal(''))
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

  const { error } = await supabase.auth.admin.updateUserById(user.id, {
    user_metadata: {
      name: parsed.data.name,
      avatar_url: parsed.data.avatar_url || null
    }
  })

  if (error) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Não foi possível atualizar o perfil'
    })
  }

  return { ok: true }
})
