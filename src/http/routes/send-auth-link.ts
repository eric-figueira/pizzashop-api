import { createId } from '@paralleldrive/cuid2'
import type { Router } from 'express'
import nodemailer from 'nodemailer'
import z from 'zod'
import { db } from '../../db/connection'
import { authLinks } from '../../db/schema'
import { env } from '../../env'
import { NotFoundError } from '../errors'
import { validate } from '../middlewares/request-parameters-validator'
import { mail } from '../services/mail'

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
      throw new NotFoundError('User not found.')
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
    const info = await mail.sendMail({
      from: {
        name: 'Pizza Shop',
        address: 'hi@pizzashop.com'
      },
      to: email,
      subject: 'Authenticate to Pizza Shop',
      text: `Click the link to authenticate: ${authLink.toString()}`,
    })

    console.log(nodemailer.getTestMessageUrl(info))
    console.log(authLink.toString())

    res.send()
  })
}
