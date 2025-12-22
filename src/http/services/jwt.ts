import z from 'zod'
import { env } from '../../env'
import jwt from 'jsonwebtoken'

const userPaylodSchema = z.object({
  sub: z.string(),
  restaurantId: z.string().nullable(),
})

type UserPayload = z.infer<typeof userPaylodSchema>

export const sign = (data: UserPayload, expiresIn?: number) => {
  const token = jwt.sign(
    data, 
    env.JWT_SECRET_KEY, 
    { 
      algorithm: 'HS256',
      expiresIn: expiresIn || '1d',
    },
  )

  return token
}

export const verify = (token: string) => {
  z.jwt().parse(token)

  const decoded = jwt.verify(token, env.JWT_SECRET_KEY)
  const payload = userPaylodSchema.parse(decoded)

  return payload
}