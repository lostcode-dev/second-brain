import type { Request, Response } from 'express'
import { logger } from '../utils/index.js'

export function exampleWebhook(req: Request, res: Response): void {
  logger.info('[webhook] payload recebido', req.body)
  res.json({ received: true })
}
