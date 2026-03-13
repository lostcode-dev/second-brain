import express from 'express'
import routes from './routes/index.js'
import { errorHandler, requestLogger } from './middlewares/index.js'

const app = express()

app.use(express.json())
app.use(requestLogger)

app.use('/api', routes)

app.use(errorHandler)

export default app
