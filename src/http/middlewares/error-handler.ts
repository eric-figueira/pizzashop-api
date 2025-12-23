import type { NextFunction, Request, Response } from 'express'
import type { AppError } from '../errors/app-error'

export const errorHandler = (error: AppError, req: Request, res: Response, next: NextFunction) => {
  const code = error.statusCode || 500
  const message = error.message || 'Internal Server Error'

  return res.status(code).json({
    status: 'error',
    message
  })
}
