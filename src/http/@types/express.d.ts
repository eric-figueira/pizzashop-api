import 'express'

declare global {
  namespace Express {
    interface Request {
      auth?: {
        sub: string
        restaurantId: string | null
      }
    }
  }
}
