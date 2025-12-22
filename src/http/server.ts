import express, { Router } from 'express'
import * as r from './routes'
const cookieParser = require('cookie-parser')

const app = express()
const router = Router()

app.use(express.json())
app.use(cookieParser())
app.use('/api/v1', router)

router.get('/', (req, res) => {
  res.send('Welcome to the API')
})

r.setUpRegisterRestaurantRoute(router)
r.setUpSendAuthLinkRoute(router)


app.listen(3000, () => {
  console.log('Server is running on port 3000');
})