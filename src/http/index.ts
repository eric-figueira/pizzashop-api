import express from 'express'
import { db } from '../db/connection'
import { restaurants, users } from '../db/schema'
import z from 'zod'
import { validate } from './middlewares/request-body-validator'

const app = express()

const insertRestaurantSchema = z.object({
  restaurantName: z.string().nonempty(),
  managerName: z.string().nonempty(),
  email: z.email(),
  phone: z.string().nullable(),
})

type InsertRestaurantDTO = z.infer<typeof insertRestaurantSchema>

app.post('/restaurants', validate(insertRestaurantSchema), async (req, res) => {
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

  res.status(204)
})

app.listen(3000, () => {
  console.log('Server is running on port 3000');
})