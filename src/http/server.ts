import express, { Router } from 'express'
import * as r from './routes'

const app = express()
const router = Router()

app.use(express.json())
app.use('/api/v1', router)

router.get('/', () => {
  return 'Welcome to the API'
})

r.setUpRegisterRestaurantRoute(router)
r.setUpSendAuthLinkRoute(router)


app.listen(3000, () => {
  console.log('Server is running on port 3000');
})