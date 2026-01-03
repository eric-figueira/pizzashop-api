import type { Router } from 'express'
import z from 'zod'
import { db } from '../../db/connection'
import { restaurants, users } from '../../db/schema'
import { validate } from '../middlewares/request-parameters-validator'

const insertRestaurantSchema = z.object({
  restaurantName: z.string().nonempty(),
  managerName: z.string().nonempty(),
  email: z.email(),
  phone: z.string().nullable(),
})

type InsertRestaurantDTO = z.infer<typeof insertRestaurantSchema>

export const setUpRegisterRestaurantRoute = (router: Router) => {
  router.post('/restaurants', validate(insertRestaurantSchema), async (req, res) => {
    const { restaurantName, managerName, email, phone } = req.body as InsertRestaurantDTO

    const [manager] = await db
      .insert(users)
      .values({
        name: managerName,
        email,
        phone,
        role: 'manager'
      })
      .returning({ 
        id: users.id 
    })

    await db.insert(restaurants).values({
      name: restaurantName,
      managerId: manager!.id
    })

    res.status(204).send()
  })
}
