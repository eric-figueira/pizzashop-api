import type { Router } from "express";
import z from "zod";
import { validate } from "../middlewares/request-parameters-validator";
import { db } from "../../db/connection";
import dayjs from "dayjs";
import { sign } from "../services/jwt";
import { authLinks } from "../../db/schema";
import { eq } from "drizzle-orm";

const authenticateFromLinkSchema = z.object({
  code: z.string(),
  redirect: z.string(),
})

type AuthenticateFromLinkDTO = z.infer<typeof authenticateFromLinkSchema>

export const setUpAuthenticateFromLinkRoute = (router: Router) => {
  router.get('/auth-links/authenticate', validate(authenticateFromLinkSchema, "query"), async (req, res) => {
    const { code, redirect } = req.query as AuthenticateFromLinkDTO

    const authLinkFromCode = await db.query.authLinks.findFirst({
      where(fields, { eq }) {
        return eq(fields.code, code)
      },
    })

    if (!authLinkFromCode) {
      throw new Error('Auth link not found.')
    }

    const daysSinceAuthLinkCreation = dayjs().diff(authLinkFromCode.createdAt, 'day')

    if (daysSinceAuthLinkCreation > 7) {
      throw new Error('Auth link expired.')
    }

    const managedRestaurant = await db.query.restaurants.findFirst({
      where(fields, { eq }) {
        return eq(fields.managerId, authLinkFromCode.userId)
      },
    })

    const token = sign({ 
      sub: authLinkFromCode.userId,
      restaurantId: managedRestaurant ? managedRestaurant.id : null,
    })

    res.cookie('auth', token, { 
      httpOnly: true,
      maxAge: 60 * 60 * 24 * 7, // 7 days,
      path: '/',
    })

    await db.delete(authLinks).where(eq(authLinks.code, code))

    res.redirect(redirect)
  })
}