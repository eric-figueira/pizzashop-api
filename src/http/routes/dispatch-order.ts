import { eq } from "drizzle-orm";
import type { Router } from "express";
import z from "zod";
import { db } from "../../db/connection";
import { orders } from "../../db/schema";
import { AppError, NotFoundError, UnauthorizedError } from "../errors";
import { authenticate } from "../middlewares/authentication";
import { validate } from "../middlewares/request-parameters-validator";

const dispatchOrderSchema = z.object({
  orderId: z.string(),
})

type DispatchOrderDTO = z.infer<typeof dispatchOrderSchema>

export const setUpDispatchOrderRoute = (router: Router) => {
  router.patch('/orders/:orderId/dispatch', authenticate, validate(dispatchOrderSchema), async (req, res) => {
    const { orderId } = req.params as DispatchOrderDTO
    const { restaurantId } = req.auth!

    if (!restaurantId) {
      throw new UnauthorizedError('User is not a restaurant manager.')
    }

    const order = await db.query.orders.findFirst({
      where(fields, { eq }) {
        return eq(fields.id, orderId)
      },
    })

    if (!order) {
      throw new NotFoundError('Order not found.')
    }

    if (order.status !== 'processing') {
      throw new AppError('You cannot dispatch orders that are not being processed.', 400)
    }

    await db.update(orders).set({ status: 'delivering' }).where(eq(orders.id, orderId))
  })
}
