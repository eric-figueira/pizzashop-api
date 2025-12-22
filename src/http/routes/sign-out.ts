import type { Router } from 'express'

export const setUpSignOutRoute = (router: Router) => {
  router.post('/sign-out', (req, res) => {
    res.clearCookie('auth')
  })
}