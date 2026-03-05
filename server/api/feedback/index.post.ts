import { z } from 'zod'
import { getSupabaseAdminClient } from '../../utils/supabase'
import { requireAuthUser } from '../../utils/require-auth'

const bodySchema = z.object({
  type: z.enum(['bug', 'suggestion', 'improvement', 'praise']),
  title: z.string().min(1, 'Título é obrigatório').max(200),
  description: z.string().min(1, 'Descrição é obrigatória').max(5000),
  techContext: z.object({
    route: z.string(),
    userAgent: z.string(),
    appVersion: z.string(),
    screenResolution: z.string(),
    timestamp: z.string()
  }).nullable().optional(),
  attachments: z.array(z.object({
    fileName: z.string().min(1),
    fileUrl: z.string().url(),
    fileType: z.string().min(1)
  })).optional()
})

export default eventHandler(async (event) => {
  const user = await requireAuthUser(event)
  const body = await readBody(event)
  const parsed = bodySchema.parse(body)

  const supabase = getSupabaseAdminClient()

  const { data, error } = await supabase
    .from('feedbacks')
    .insert({
      user_id: user.id,
      type: parsed.type,
      title: parsed.title,
      description: parsed.description,
      tech_context: parsed.techContext ?? null
    })
    .select()
    .single()

  if (error) {
    throw createError({ statusCode: 500, statusMessage: 'Falha ao criar feedback', data: error.message })
  }

  const record = data as Record<string, unknown>

  if (parsed.attachments && parsed.attachments.length > 0) {
    const attachmentRows = parsed.attachments.map(a => ({
      feedback_id: record.id as string,
      file_name: a.fileName,
      file_url: a.fileUrl,
      file_type: a.fileType
    }))

    const { error: attError } = await supabase
      .from('feedback_attachments')
      .insert(attachmentRows)

    if (attError) {
      console.error('Failed to insert attachments:', attError.message)
    }
  }

  return data
})
