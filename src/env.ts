import dotenv from 'dotenv'
dotenv.config()

import { z } from 'zod'

const envSchema = z.object({
  API_BASE_URL: z.url().min(1),
  AUTH_REDIRECT_URL: z.url().min(1),
  DATABASE_URL: z.url().min(1),
})

export const env = envSchema.parse(process.env)
