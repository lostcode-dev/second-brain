import { Router } from 'express'
import { cronAuth } from '../middlewares/index.js'
import { closeDay } from '../controllers/index.js'

const router = Router()

router.post('/close-day', cronAuth, closeDay)

export default router
