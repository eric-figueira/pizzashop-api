import express, { Router } from 'express'
import cookieParser from 'cookie-parser'
import { errorHandler } from './middlewares/error-handler'
import { setUpRoutes } from './setup-routes'

const app = express()
const router = Router()

app.use(express.json())
app.use(cookieParser())
app.use(router)

setUpRoutes(router)

app.use(errorHandler)

app.listen(3000, () => {
  console.log('Server is running on port 3000');
})