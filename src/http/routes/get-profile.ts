import type { Router } from 'express'
import { verify } from '../services/jwt'
import { db } from '../../db/connection'

export const setUpGetProfileRoute = (router: Router) => {
  router.get('/me', async (req, res) => {
    const authCookie = req.cookies.auth

    const payload = verify(authCookie)

    if (!payload) {
      throw new Error('Unauthorized.')
    }

    const { sub } = payload
    const user = await db.query.users.findFirst({
      where(fields, { eq }) {
        return eq(fields.id, sub)
      },
    })

    if (!user) {
      throw new Error('User not found.')
    }

    res.send(user)
  })
}