import type { Request, Response, NextFunction } from 'express'
import { env } from '../config/index.js'

/**
 * Validates the Authorization header against CRON_SECRET.
 * Expected format: `Authorization: Bearer <CRON_SECRET>`
 */
export function cronAuth(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization
  const expected = `Bearer ${env.CRON_SECRET}`

  if (authHeader !== expected) {
    res.status(401).json({ error: 'Unauthorized' })
    return
  }

  next()
}
