import 'dotenv/config'
import app from './app.js'
import { env } from './config/index.js'
import { logger } from './utils/index.js'

app.listen(env.PORT, () => {
  logger.info(`Server running on port ${env.PORT} [${env.NODE_ENV}]`)
})
