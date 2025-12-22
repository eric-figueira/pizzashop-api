import type { NextFunction, Request, Response } from 'express'
import type { ZodObject } from 'zod'

const parameters = ['body', 'query', 'params'] as const
type RequestParameter = typeof parameters[number]

export const validate = (schema: ZodObject, parameter: RequestParameter = 'body') => 
  (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req[parameter])

    if (!result.success) {
      return res.status(400).json({
        errors: result.error.flatten().fieldErrors
      })
    }

    if (parameter === 'body') req[parameter] = result.data
    next()
  }