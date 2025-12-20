import express, { Router } from 'express'
import * as routes from './routes/register-restaurant'

const app = express()

const router = Router()
router.use('/api/v1', router)

routes.setUpRegisterRestaurantRoute(router)

app.use(express.json())
app.listen(3000, () => {
  console.log('Server is running on port 3000');
})