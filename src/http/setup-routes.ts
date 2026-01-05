import type { Router } from 'express'
import * as routes from './routes'

export const setUpRoutes = (router: Router) => {
  /**
   * Restaurant Routes
   */
  routes.setUpRegisterRestaurantRoute(router)
  routes.setUpGetManagedRestaurantRoute(router)

  /**
   * User Routes
   */
  routes.setUpGetProfileRoute(router)
  routes.setUpUpdateProfile(router)

  /**
   * Orders Routes
   */
  routes.setUpGetOrdersRoute(router)
  routes.setUpGetOrderDetailsRoute(router)
  routes.setUpApproveOrderRoute(router)
  routes.setUpCancelOrderRoute(router)
  routes.setUpDispatchOrderRoute(router)
  routes.setUpDeliverOrderRoute(router)

  /**
   * Authentication Routes
   */
  routes.setUpSendAuthLinkRoute(router)
  routes.setUpAuthenticateFromLinkRoute(router)
  routes.setUpSignOutRoute(router)

  /**
   * Metrics Routes
   */
  routes.setUpGetPopularProductsRoute(router)
  routes.setUpGetDailyOrdersAmount(router)
  routes.setUpGetDailyRevenueInPeriod(router)
  routes.setUpGetMonthlyRevenue(router)
  routes.setUpGetMonthlyOrdersAmount(router)
  routes.setUpGetMonthlyCancelledOrdersAmount(router)
}
