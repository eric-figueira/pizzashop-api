import express, { Router } from 'express'
import * as r from './routes'
import cookieParser from 'cookie-parser'

const app = express()
const router = Router()

app.use(express.json())
app.use(cookieParser())
app.use(router)

router.get('/', (req, res) => {
  res.send('Welcome to the API')
})

r.setUpRegisterRestaurantRoute(router)
r.setUpSendAuthLinkRoute(router)
r.setUpAuthenticateFromLinkRoute(router)


app.listen(3000, () => {
  console.log('Server is running on port 3000');
})