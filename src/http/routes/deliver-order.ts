import { eq } from "drizzle-orm";
import type { Router } from "express";
import z from "zod";
import { db } from "../../db/connection";
import { orders } from "../../db/schema";
import { AppError, NotFoundError, UnauthorizedError } from "../errors";
import { authenticate } from "../middlewares/authentication";
import { validate } from "../middlewares/request-parameters-validator";
import { BadRequestError } from "../errors/bad-request-error";

const deliverOrderSchema = z.object({
  orderId: z.string(),
})

type DeliverOrderDTO = z.infer<typeof deliverOrderSchema>

export const setUpDeliverOrderRoute = (router: Router) => {
  router.patch('/orders/:orderId/deliver', authenticate, validate(deliverOrderSchema, 'params'), async (req, res) => {
    const { orderId } = req.params as DeliverOrderDTO
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

    if (order.status !== 'delivering') {
      throw new BadRequestError('You cannot deliver orders that are not being delivered.')
    }

    await db.update(orders).set({ status: 'delivered' }).where(eq(orders.id, orderId))
    res.send()
  })
}
