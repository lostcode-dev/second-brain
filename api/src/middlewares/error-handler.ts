import type { Request, Response, NextFunction } from 'express'
import { logger } from '../utils/index.js'

export interface AppError extends Error {
  statusCode?: number
  data?: unknown
}

export function errorHandler(err: AppError, _req: Request, res: Response, _next: NextFunction): void {
  const statusCode = err.statusCode ?? 500
  const message = err.message || 'Internal Server Error'

  logger.error(`[${statusCode}] ${message}`, err.data)

  res.status(statusCode).json({
    error: message,
    ...(err.data ? { data: err.data } : {}),
  })
}
