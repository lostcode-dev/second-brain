import { env } from '../config/index.js'

export enum LogLevel {
  Debug = 'DEBUG',
  Info = 'INFO',
  Warn = 'WARN',
  Error = 'ERROR',
}

function log(level: LogLevel, message: string, data?: unknown): void {
  const timestamp = new Date().toISOString()
  const payload = data !== undefined ? ` ${JSON.stringify(data)}` : ''
  console.log(`[${timestamp}] [${level}] ${message}${payload}`)
}

export const logger = {
  debug: (msg: string, data?: unknown) => {
    if (env.NODE_ENV === 'development') log(LogLevel.Debug, msg, data)
  },
  info: (msg: string, data?: unknown) => log(LogLevel.Info, msg, data),
  warn: (msg: string, data?: unknown) => log(LogLevel.Warn, msg, data),
  error: (msg: string, data?: unknown) => log(LogLevel.Error, msg, data),
}
