import { CloseDayService } from '../services/index.js'
import { logger } from '../utils/index.js'

let running = false

export async function closeDayJob(): Promise<void> {
  if (running) {
    logger.warn('[close-day-job] já em execução, ignorando esta invocação')
    return
  }

  running = true
  const startedAt = Date.now()

  try {
    logger.info('[close-day-job] iniciando...')
    const service = new CloseDayService()
    const result = await service.execute()
    const elapsed = ((Date.now() - startedAt) / 1000).toFixed(2)
    logger.info(`[close-day-job] concluído em ${elapsed}s`, result)
  } catch (err) {
    logger.error('[close-day-job] falha', err instanceof Error ? err.message : err)
  } finally {
    running = false
  }
}
