import jwt from 'jsonwebtoken'
import { NextFunction, Request, Response } from 'express'
import EnvManager from '../config/EnvManager'
import ApiError from '../errors/ApiError'

export const verifyToken = async (req: Request, res: Response, next: NextFunction) => {
  const token = req.headers['authorization']?.split(' ')[1]

  try {
    if (!token || token === 'null')
      throw new ApiError({
        name: 'NO_TOKEN_PROVIDED',
        message: 'Authorization token is required.',
        code: 'ERR_NT',
        status: 401,
      })

    const decoded = jwt.verify(token, EnvManager.getAuthJwtSecret())
    req.user = decoded

    next()
  } catch (error) {
    return next(error)
  }
}

export const inRoles = (roles: string[] = []) => {
  return async (req: any, res: Response, next: NextFunction) => {
    try {
      const accede = roles.some(el => req.user.role_name === el)

      if (!accede) {
        throw new ApiError({
          name: 'FORBIDDEN_ERROR',
          message: 'User does not have the necessary permissions',
          code: 'ERR_FORB',
          status: 403,
        })
      }

      return next()
    } catch (error) {
      return next(error)
    }
  }
}
