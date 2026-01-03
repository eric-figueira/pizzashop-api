import { eq } from "drizzle-orm";
import type { Router } from "express";
import z from "zod";
import { db } from "../../db/connection";
import { orders } from "../../db/schema";
import { AppError, NotFoundError, UnauthorizedError } from "../errors";
import { authenticate } from "../middlewares/authentication";
import { validate } from "../middlewares/request-parameters-validator";
import { BadRequestError } from "../errors/bad-request-error";

const cancelOrderSchema = z.object({
  orderId: z.string(),
})

type CancelOrderDTO = z.infer<typeof cancelOrderSchema>

export const setUpCancelOrderRoute = (router: Router) => {
  router.patch('/orders/:orderId/cancel', authenticate, validate(cancelOrderSchema, 'params'), async (req, res) => {
    const { orderId } = req.params as CancelOrderDTO
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

    if (!['pending', 'processing'].includes(order.status)) {
      throw new BadRequestError('You cannot cancel orders after dispatch.')
    }

    await db.update(orders).set({ status: 'cancelled' }).where(eq(orders.id, orderId))
    res.send()
  })
}
