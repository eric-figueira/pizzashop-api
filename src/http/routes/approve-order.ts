import { eq } from 'drizzle-orm'
import type { Router } from 'express'
import z from 'zod'
import { db } from '../../db/connection'
import { orders } from '../../db/schema'
import { NotFoundError, UnauthorizedError } from '../errors'
import { BadRequestError } from '../errors/bad-request-error'
import { authenticate } from '../middlewares/authentication'
import { validate } from '../middlewares/request-parameters-validator'

const approveOrderSchema = z.object({
  orderId: z.string(),
})

type ApproveOrderDTO = z.infer<typeof approveOrderSchema>

export const setUpApproveOrderRoute = (router: Router) => {
  router.patch('/orders/:orderId/approve', authenticate, validate(approveOrderSchema, 'params'), async (req, res) => {
    const { orderId } = req.params as ApproveOrderDTO
    const { restaurantId } = req.auth!

    if (!restaurantId) {
      throw new UnauthorizedError('User is not a restaurant manager.')
    }

    const order = await db.query.orders.findFirst({
      where(fields, { eq, and }) {
        return and(
          eq(fields.id, orderId), 
          eq(fields.restaurantId, restaurantId)
        )
      },
    })

    if (!order) {
      throw new NotFoundError('Order not found.')
    }

    if (order.status !== 'pending') {
      throw new BadRequestError('Order is not pending.')
    }

    await db.update(orders).set({ status: 'processing' }).where(eq(orders.id, orderId))
    res.send()
  })
}
