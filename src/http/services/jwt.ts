import z from 'zod'
import { env } from '../../env'

const jwt = require('jsonwebtoken')

const userPaylodSchema = z.object({
  sub: z.string(),
  restaurantId: z.string().nullable(),
})

type UserPayload = z.infer<typeof userPaylodSchema>

export const sign = (data: UserPayload, expiresIn: number) => {
  jwt.sign(
    data, 
    env.JWT_SECRET_KEY, 
    { algorithm: 'HS256' },
    { expiresIn }
  )
}

export const verify = (token: string) => {
  z.jwt().parse(token)

  const decoded = jwt.verify(token, env.JWT_SECRET_KEY)
  const payload = userPaylodSchema.parse(decoded)

  return payload
}