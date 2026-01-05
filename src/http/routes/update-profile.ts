import { eq } from 'drizzle-orm'
import type { Router } from 'express'
import z from 'zod'
import { db } from '../../db/connection'
import { restaurants } from '../../db/schema'
import { UnauthorizedError } from '../errors'
import { authenticate } from '../middlewares/authentication'
import { validate } from '../middlewares/request-parameters-validator'

const updateProfileSchema = z.object({
  name: z.string(),
  description: z.string().optional(),
})

type UpdateProfileDTO = z.infer<typeof updateProfileSchema>

export const setUpUpdateProfile = (router: Router) => {
  router.post('/me', authenticate, validate(updateProfileSchema), async (req, res) => {
    const { restaurantId } = req.auth!

    if (!restaurantId) {
      throw new UnauthorizedError('User is not a restaurant manager.')
    }

    const { name, description } = req.body as UpdateProfileDTO

    await db
      .update(restaurants)
      .set({
        name,
        description,
      })
      .where(eq(restaurants.id, restaurantId))

    res.send(204)
  })
}
