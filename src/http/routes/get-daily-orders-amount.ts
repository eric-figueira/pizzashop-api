import dayjs from 'dayjs'
import { and, count, eq, gte, sql } from 'drizzle-orm'
import type { Router } from 'express'
import { db } from '../../db/connection'
import { orders } from '../../db/schema'
import { UnauthorizedError } from '../errors'
import { authenticate } from '../middlewares/authentication'

export const setUpGetDailyOrdersAmount = (router: Router) => {
  router.get('/metrics/daily-orders-amount', authenticate, async (req, res) => {
    const { restaurantId } = req.auth!

    if (!restaurantId) {
      throw new UnauthorizedError('User is not a restaurant manager.')
    }

    const today = dayjs()

    const yesterday = today.subtract(1, 'day')
    const startOfYesterday = yesterday.startOf('day')

    const ordersPerDay = await db
      .select({
        dayWithMonthAndYear: sql<string>`TO_CHAR(${orders.createdAt}, 'YYYY-MM-DD')`,
        amount: count(),
      })
      .from(orders)
      .where(and(
        eq(orders.restaurantId, restaurantId),
        gte(orders.createdAt, startOfYesterday.toDate())
      ))
      .groupBy(sql`TO_CHAR(${orders.createdAt}, 'YYYY-MM-DD')`)
    
    const todayWithMonthAndYear = today.format('YYYY-MM-DD')
    const yesterdayWithMonthAndYear = yesterday.format('YYYY-MM-DD')

    const todayOrdersAmount  = ordersPerDay.find(ordersPerDay => {
      return ordersPerDay.dayWithMonthAndYear === todayWithMonthAndYear
    })

    const yesterdayOrdersAmount  = ordersPerDay.find(ordersPerDay => {
      return ordersPerDay.dayWithMonthAndYear === yesterdayWithMonthAndYear
    })

    const diffFromYesterday = todayOrdersAmount && yesterdayOrdersAmount
      ? (todayOrdersAmount.amount * 100) / yesterdayOrdersAmount.amount
      : null

    res.send({
      amount: todayOrdersAmount ? todayOrdersAmount.amount : 0,
      diffFromYesterday: diffFromYesterday ? Number((diffFromYesterday - 100).toFixed(2)) : 0,
    })
  })
}
