import { requireAuthUser } from '../../utils/require-auth'

export default eventHandler(async (event) => {
  const user = await requireAuthUser(event)

  return {
    id: user.id,
    email: user.email,
    name: user.user_metadata?.name || '',
    avatar_url: user.user_metadata?.avatar_url || ''
  }
})
