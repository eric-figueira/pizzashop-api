import dayjs from 'dayjs'
import { and, count, eq, gte, sql } from 'drizzle-orm'
import type { Router } from 'express'
import { db } from '../../db/connection'
import { orders } from '../../db/schema'
import { UnauthorizedError } from '../errors'
import { authenticate } from '../middlewares/authentication'

export const setUpGetMonthlyCancelledOrdersAmount = (router: Router) => {
  router.get('/metrics/monthly-cancelled-orders-amount', authenticate, async (req, res) => {
    const { restaurantId } = req.auth!

    if (!restaurantId) {
      throw new UnauthorizedError('User is not a restaurant manager.')
    }

    const today = dayjs()

    const lastMonth = today.subtract(1, 'month')
    const startOfLastMonth = lastMonth.startOf('month')

    const ordersPerMonth = await db
      .select({
        monthWithYear: sql<string>`TO_CHAR(${orders.createdAt}, 'YYYY-MM')`,
        amount: count(),
      })
      .from(orders)
      .where(and(
        eq(orders.restaurantId, restaurantId),
        eq(orders.status, 'cancelled'),
        gte(orders.createdAt, startOfLastMonth.toDate())
      ))
      .groupBy(sql`TO_CHAR(${orders.createdAt}, 'YYYY-MM')`)
    
    const currentMonthWithYear = today.format('YYYY-MM') // 2025-12
    const lastMonthWithYear = lastMonth.format('YYYY-MM') // 2025-11

    const currentMonthOrdersAmount  = ordersPerMonth.find(ordersPerMonth => {
      return ordersPerMonth.monthWithYear === currentMonthWithYear
    })

    const lastMonthOrdersAmount  = ordersPerMonth.find(ordersPerMonth => {
      return ordersPerMonth.monthWithYear === lastMonthWithYear
    })

    const diffFromLastMonth = currentMonthOrdersAmount && lastMonthOrdersAmount
      ? (currentMonthOrdersAmount.amount * 100) / lastMonthOrdersAmount.amount
      : null

    res.send({
      revenue: currentMonthOrdersAmount?.amount,
      diffFromLastMonth: diffFromLastMonth ? Number((diffFromLastMonth - 100).toFixed(2)) : 0,
    })
  })
}
