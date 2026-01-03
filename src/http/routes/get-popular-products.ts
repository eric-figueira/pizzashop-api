import type { Router } from 'express'
import { db } from '../../db/connection'
import { NotFoundError, UnauthorizedError } from '../errors'
import { authenticate } from '../middlewares/authentication'
import { orderItems, orders, products } from '../../db/schema'
import { desc, eq, sum } from 'drizzle-orm'

export const setUpGetPopularProductsRoute = (router: Router) => {
  router.get('/metrics/popular-products', authenticate, async (req, res) => {
    const { restaurantId } = req.auth!
    
    if (!restaurantId) {
      throw new UnauthorizedError('User is not a restaurant manager.')
    }

    const popularProducts = await db
      .select({
        product: products.name,
        amount: sum(orderItems.quantity).mapWith(Number)
      })
      .from(orderItems)
      .leftJoin(orders, eq(orders.id, orderItems.orderId))
      .leftJoin(products, eq(products.id, orderItems.productId))
      .where(eq(orders.restaurantId, restaurantId))
      .groupBy(products.name)
      .orderBy((fields) => {
        return desc(fields.amount)
      })
      .limit(5)
    
    res.send(popularProducts)
  })
}