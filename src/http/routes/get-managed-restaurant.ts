import type { Router } from "express";
import { db } from "../../db/connection";
import { UnauthorizedError } from "../errors";
import { authenticate } from "../middlewares/authentication";

export const setUpGetManagedRestaurantRoute = (router: Router) => {
  router.get('/managed-restaurant', authenticate, async (req, res) => {
      const { restaurantId } = req.auth!

      if (!restaurantId) {
        throw new UnauthorizedError('User is not a restaurant manager.')
      }

      const resturant = await db.query.restaurants.findFirst({
        where(fields, { eq }) {
          return eq(fields.id, restaurantId)
        },
      })
  
      res.send(resturant)
    })
}