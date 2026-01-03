import dayjs from 'dayjs'
import { and, eq, gte, sql, sum } from 'drizzle-orm'
import type { Router } from 'express'
import { db } from '../../db/connection'
import { orders } from '../../db/schema'
import { UnauthorizedError } from '../errors'
import { authenticate } from '../middlewares/authentication'

export const setUpGetMonthlyRevenue = (router: Router) => {
  router.get('/metrics/monthly-revenue', authenticate, async (req, res) => {
    const { restaurantId } = req.auth!

    if (!restaurantId) {
      throw new UnauthorizedError('User is not a restaurant manager.')
    }

    const today = dayjs()

    const lastMonth = today.subtract(1, 'month')
    const startOfLastMonth = lastMonth.startOf('month')

    const monthlyRevenues = await db
      .select({
        monthWithYear: sql<string>`TO_CHAR(${orders.createdAt}, 'YYYY-MM')`,
        revenue: sum(orders.totalInCents).mapWith(Number)
      })
      .from(orders)
      .where(and(
        eq(orders.restaurantId, restaurantId),
        gte(orders.createdAt, startOfLastMonth.toDate())
      ))
      .groupBy(sql`TO_CHAR(${orders.createdAt}, 'YYYY-MM')`)
    
    const currentMonthWithYear = today.format('YYYY-MM') // 2025-12
    const lastMonthWithYear = lastMonth.format('YYYY-MM') // 2025-11

    const currentMonthRevenue  = monthlyRevenues.find(monthRevenue => {
      return monthRevenue.monthWithYear === currentMonthWithYear
    })

    const lastMonthRevenue  = monthlyRevenues.find(monthRevenue => {
      return monthRevenue.monthWithYear === lastMonthWithYear
    })

    const diffFromLastMonth = currentMonthRevenue && lastMonthRevenue
      ? (currentMonthRevenue.revenue * 100) / lastMonthRevenue.revenue
      : null

    res.send({
      revenue: currentMonthRevenue?.revenue,
      diffFromLastMonth: diffFromLastMonth ? Number((diffFromLastMonth - 100).toFixed(2)) : 0,
    })
  })
}
