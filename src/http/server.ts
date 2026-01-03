import express, { Router } from 'express'
import * as r from './routes'
import cookieParser from 'cookie-parser'
import { errorHandler } from './middlewares/error-handler'

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
r.setUpSignOutRoute(router)
r.setUpGetProfileRoute(router)
r.setUpGetManagedRestaurantRoute(router)
r.setUpGetOrderDetailsRoute(router)
r.setUpApproveOrderRoute(router)
r.setUpCancelOrderRoute(router)
r.setUpDispatchOrderRoute(router)
r.setUpDeliverOrderRoute(router)
r.setUpGetOrdersRoute(router)
r.setUpGetMonthlyRevenue(router)
r.setUpGetDailyOrdersAmount(router)
r.setUpGetMonthlyOrdersAmount(router)
r.setUpGetMonthlyCancelledOrdersAmount(router)

app.use(errorHandler)

app.listen(3000, () => {
  console.log('Server is running on port 3000');
})