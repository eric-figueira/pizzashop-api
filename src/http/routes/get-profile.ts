import type { Router } from 'express'
import { verify } from '../services/jwt'
import { db } from '../../db/connection'
import { NotFoundError, UnauthorizedError } from '../errors'

export const setUpGetProfileRoute = (router: Router) => {
  router.get('/me', async (req, res) => {
    const authCookie = req.cookies.auth

    const payload = verify(authCookie)

    if (!payload) {
      throw new UnauthorizedError('Invalid or missing authentication token.')
    }

    const { sub } = payload
    const user = await db.query.users.findFirst({
      where(fields, { eq }) {
        return eq(fields.id, sub)
      },
    })

    if (!user) {
      throw new NotFoundError('User not found.')
    }

    res.send(user)
  })
}