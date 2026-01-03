import type { Router } from 'express'
import z from 'zod'
import { db } from '../../db/connection'
import { NotFoundError, UnauthorizedError } from '../errors'
import { authenticate } from '../middlewares/authentication'
import { validate } from '../middlewares/request-parameters-validator'

const getProfileSchema = z.object({
  orderId: z.string(),
})

type GetProfileDTO = z.infer<typeof getProfileSchema>

export const setUpGetOrderDetailsRoute = (router: Router) => {
  router.get('/orders/:orderId', authenticate, validate(getProfileSchema, 'params'), async (req, res) => {
    const { orderId } = req.params as GetProfileDTO
    const { restaurantId } = req.auth!

    if (!restaurantId) {
      throw new UnauthorizedError('User is not a restaurant manager.')
    }

    const order = await db.query.orders.findFirst({
      columns: {
        id: true,
        createdAt: true,
        status: true,
        totalInCents: true,
      },
      with: {
        customer: {
          columns: {
            name: true,
            phone: true,
            email: true,
          },
        },
        orderItems: {
          columns: {
            id: true,
            priceInCents: true,
            quantity: true,
          },
          with: {
            product: {
              columns: {
                name: true,
              },
            },
          },
        },
      },
      where(fields, { eq, and }) {
        return and(
          eq(fields.id, orderId),
          eq(fields.restaurantId, restaurantId),
        )
      },
    })

    if (!order) {
      throw new NotFoundError('Order not found.')
    }

    res.send(order)
  })
}
