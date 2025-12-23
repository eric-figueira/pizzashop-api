import type { Router } from "express";
import { verify } from "../services/jwt";
import { db } from "../../db/connection";

export const setUpGetManagedRestaurantRoute = (router: Router) => {
  router.get('/managed-restaurant', async (req, res) => {
      const authCookie = req.cookies.auth
  
      const payload = verify(authCookie)
  
      if (!payload) {
        throw new Error('Unauthorized.')
      }
  
      const { restaurantId } = payload
      if (!restaurantId) {
        throw new Error('User is not a restaurant manager.')
      }

      const resturant = await db.query.restaurants.findFirst({
        where(fields, { eq }) {
          return eq(fields.id, restaurantId)
        },
      })
  
      res.send(resturant)
    })
}