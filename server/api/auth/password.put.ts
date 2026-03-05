import { z } from 'zod'
import { requireAuthUser } from '../../utils/require-auth'
import { getSupabaseAnonClient } from '../../utils/supabase-anon'
import { getSupabaseAdminClient } from '../../utils/supabase'

const schema = z.object({
  current_password: z.string().min(8, 'Senha deve ter pelo menos 8 caracteres'),
  new_password: z.string().min(8, 'Senha deve ter pelo menos 8 caracteres')
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

  if (parsed.data.current_password === parsed.data.new_password) {
    throw createError({
      statusCode: 400,
      statusMessage: 'A nova senha deve ser diferente da atual'
    })
  }

  // Verify current password by attempting sign in
  const supabaseAnon = getSupabaseAnonClient()
  const { error: signInError } = await supabaseAnon.auth.signInWithPassword({
    email: user.email || '',
    password: parsed.data.current_password
  })

  if (signInError) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Senha atual incorreta'
    })
  }

  // Update password using admin client
  const supabaseAdmin = getSupabaseAdminClient()
  const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(user.id, {
    password: parsed.data.new_password
  })

  if (updateError) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Não foi possível alterar a senha'
    })
  }

  return { ok: true }
})
