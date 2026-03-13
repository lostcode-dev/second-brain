import { Router } from 'express'
import { exampleWebhook } from '../controllers/index.js'

const router = Router()

router.post('/example', exampleWebhook)

export default router
