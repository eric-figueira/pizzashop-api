import type { NextFunction, Request, Response } from "express";
import { UnauthorizedError } from "../errors";
import { verify } from "../services/jwt";

export const authenticate = (req: Request, res: Response, next: NextFunction) => {
  const authCookie = req.cookies.auth

  if (!authCookie) {
     throw new UnauthorizedError('Missing authentication token.')
  }

  const payload = verify(authCookie)

  if (!payload) {
    throw new UnauthorizedError('Invalid authentication token.')
  }
}