import type { Router } from 'express'
import z from 'zod'
import { validate } from '../middlewares/request-body-validator'
import { db } from '../../db/connection'
import { authLinks } from '../../db/schema'
import { createId } from '@paralleldrive/cuid2'
import { env } from '../../env'

const sendAuthLinkSchema = z.object({
  email: z.email(),
})

type SendAuthLinkDTO = z.infer<typeof sendAuthLinkSchema>

export const setUpSendAuthLinkRoute = (router: Router) => {
  router.post('/authenticate', validate(sendAuthLinkSchema), async (req, res) => {
    const { email } = req.body as SendAuthLinkDTO

    const userFromEmail = await db.query.users.findFirst({
      where(fields, { eq }) {
        return eq(fields.email, email)
      },
    })
    
    if (!userFromEmail) {
      throw new Error('User not found.')
    }

    const authLinkCode = createId()

    await db.insert(authLinks).values({
      userId: userFromEmail.id,
      code: authLinkCode,
    })

    // http://localhost:3000/auth-links/authenticate?code=CODE
    const authLink = new URL("/auth-links/authenticate", env.API_BASE_URL)
    authLink.searchParams.set('code', authLinkCode)
    authLink.searchParams.set('redirect', env.AUTH_REDIRECT_URL)

    // Send the auth link via email (not implemented here)
    console.log(authLink.toString())

    res.send()
  })
}