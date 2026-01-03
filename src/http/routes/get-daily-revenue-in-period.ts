import dayjs from 'dayjs'
import { and, eq, gte, lte, sql, sum } from 'drizzle-orm'
import type { Router } from 'express'
import z from 'zod'
import { db } from '../../db/connection'
import { orders } from '../../db/schema'
import { UnauthorizedError } from '../errors'
import { BadRequestError } from '../errors/bad-request-error'
import { authenticate } from '../middlewares/authentication'
import { validate } from '../middlewares/request-parameters-validator'

const getDailyRevenueInPeriodSchema = z.object({
  from: z.string().optional(),
  to: z.string().optional(),
})

type GetDailyRevenueInPeriodDTO = z.infer<typeof getDailyRevenueInPeriodSchema>

export const setUpGetDailyRevenueInPeriod = (router: Router) => {
  router.get('/metrics/daily-revenue-in-period', authenticate, validate(getDailyRevenueInPeriodSchema, 'query'), async (req, res) => {
    const { restaurantId } = req.auth!
    const { from, to } = req.query as GetDailyRevenueInPeriodDTO

    if (!restaurantId) {
      throw new UnauthorizedError('User is not a restaurant manager.')
    }

    const startDate = from ? dayjs(from) : dayjs().subtract(7, 'days')
    const endDate   = to ? dayjs(to) : from ? startDate.add(7, 'days') : dayjs()

    if (endDate.diff(startDate, 'days') > 7) {
      throw new BadRequestError('You cannot list revenue in a period grater than 7 days.')
    }

    const revenuePerDay = await db
      .select({
        date: sql<string>`TO_CHAR(${orders.createdAt}, 'DD/MM')`,
        revenue: sum(orders.totalInCents).mapWith(Number)
      })
      .from(orders)
      .where(and(
        eq(orders.restaurantId, restaurantId),
        gte(orders.createdAt, startDate.startOf('day').toDate()),
        lte(orders.createdAt, endDate.endOf('day').toDate())
      ))
      .groupBy(sql`TO_CHAR(${orders.createdAt}, 'DD/MM')`)
      
    const orderedRevenuePerDay = revenuePerDay.sort((a, b) => {
      const [dayA = 0, monthA = 0] = a.date.split('/').map(Number)
      const [dayB = 0, monthB = 0] = b.date.split('/').map(Number)

      if (monthA === monthB) {
        return dayA - dayB
      } else {
        const dateA = new Date(2026, monthA - 1)
        const dateB = new Date(2026, monthB - 1)

        return dateA.getTime() - dateB.getTime()
      }
    })

    res.send(orderedRevenuePerDay)
  })
}
