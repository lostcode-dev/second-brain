import type { Request, Response, NextFunction } from 'express'
import { CloseDayService } from '../services/index.js'

const service = new CloseDayService()

export async function closeDay(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const date = typeof req.query.date === 'string' ? req.query.date : undefined
    const from = typeof req.query.from === 'string' ? req.query.from : undefined

    const result = await service.execute(date, from)
    res.json(result)
  } catch (err) {
    next(err)
  }
}
