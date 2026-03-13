import { Router } from 'express'
import healthRoutes from './health.routes.js'
import webhooksRoutes from './webhooks.routes.js'

const router = Router()

router.use('/health', healthRoutes)
router.use('/webhooks', webhooksRoutes)

export default router
