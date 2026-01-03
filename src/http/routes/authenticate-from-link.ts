import dayjs from 'dayjs'
import { eq } from 'drizzle-orm'
import type { Router } from 'express'
import z from 'zod'
import { db } from '../../db/connection'
import { authLinks } from '../../db/schema'
import { NotFoundError, UnauthorizedError } from '../errors'
import { validate } from '../middlewares/request-parameters-validator'
import { sign } from '../services/jwt'

const authenticateFromLinkSchema = z.object({
  code: z.string(),
  redirect: z.string(),
})

type AuthenticateFromLinkDTO = z.infer<typeof authenticateFromLinkSchema>

export const setUpAuthenticateFromLinkRoute = (router: Router) => {
  router.get('/auth-links/authenticate', validate(authenticateFromLinkSchema, 'query'), async (req, res) => {
    const { code, redirect } = req.query as AuthenticateFromLinkDTO

    const authLinkFromCode = await db.query.authLinks.findFirst({
      where(fields, { eq }) {
        return eq(fields.code, code)
      },
    })

    if (!authLinkFromCode) {
      throw new NotFoundError('Auth link not found.')
    }

    const daysSinceAuthLinkCreation = dayjs().diff(authLinkFromCode.createdAt, 'day')

    if (daysSinceAuthLinkCreation > 7) {
      throw new UnauthorizedError('Auth link has expired.')
    }

    const managedRestaurant = await db.query.restaurants.findFirst({
      where(fields, { eq }) {
        return eq(fields.managerId, authLinkFromCode.userId)
      },
    })

    const token = sign({ 
      sub: authLinkFromCode.userId,
      restaurantId: managedRestaurant ? managedRestaurant.id : null,
    }, 60 * 60 * 24 * 1) // 1 day

    res.cookie('auth', token, { 
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24 * 1, // 1 day (miliseconds),
      path: '/',
    })

    await db.delete(authLinks).where(eq(authLinks.code, code))

    //res.redirect(redirect)

    res.send(200)
  })
}
