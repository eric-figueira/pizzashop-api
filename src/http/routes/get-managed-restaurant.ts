import type { Router } from "express";
import { verify } from "../services/jwt";
import { db } from "../../db/connection";
import { UnauthorizedError } from "../errors";

export const setUpGetManagedRestaurantRoute = (router: Router) => {
  router.get('/managed-restaurant', async (req, res) => {
      const authCookie = req.cookies.auth
  
      const payload = verify(authCookie)
  
      if (!payload) {
        throw new UnauthorizedError('Unauthorized.')
      }
  
      const { restaurantId } = payload
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