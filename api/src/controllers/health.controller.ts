import type { Request, Response } from 'express'
import { env } from '../config/index.js'

export function healthCheck(_req: Request, res: Response): void {
  res.json({
    status: 'ok',
    environment: env.NODE_ENV,
    timestamp: new Date().toISOString(),
  })
}
