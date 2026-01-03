import type { Router } from 'express'
import { db } from '../../db/connection'
import { NotFoundError } from '../errors'
import { authenticate } from '../middlewares/authentication'

export const setUpGetProfileRoute = (router: Router) => {
  router.get('/me', authenticate, async (req, res) => {
    const { sub } = req.auth!
    
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
