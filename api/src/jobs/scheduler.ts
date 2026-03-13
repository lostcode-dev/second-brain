import cron from 'node-cron'
import { env } from '../config/index.js'
import { logger } from '../utils/index.js'
import { closeDayJob } from './close-day.job.js'

const tasks: cron.ScheduledTask[] = []

export function startScheduler(): void {
  const tz = env.TZ
  const schedule = env.CRON_CLOSE_DAY_SCHEDULE

  if (!cron.validate(schedule)) {
    logger.error(`[scheduler] expressão cron inválida: "${schedule}"`)
    return
  }

  const closeDayTask = cron.schedule(schedule, () => void closeDayJob(), {
    timezone: tz,
  })

  tasks.push(closeDayTask)

  logger.info(`[scheduler] close-day agendado: "${schedule}" (tz: ${tz})`)
}

export function stopScheduler(): void {
  for (const task of tasks) {
    task.stop()
  }
  tasks.length = 0
  logger.info('[scheduler] todos os cron jobs parados')
}
