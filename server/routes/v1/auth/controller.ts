import { NextFunction, Request, Response } from 'express'
import passport from 'passport'
import jwt from 'jsonwebtoken'
import { UserAttributes } from '../../../database/models/User'
import EnvManager from '../../../config/EnvManager'
import ApiError from '../../../errors/ApiError'

export const authUser = async (req: Request, res: Response, next: NextFunction) => {
  passport.authenticate('local', (error: Error, user: UserAttributes) => {
    if (error) return next(error)

    req.login(user, { session: false }, async error => {
      if (error) return next(error)

      try {
        const payload = {
          id: user.id,
          fullname: user.fullname,
          doc_number: user.doc_number,
          role_name: user.role_name,
        }
        const authJwtSecret = EnvManager.getAuthJwtSecret()
        const authJwtTime = EnvManager.getAuthJwtTime()
        if (!authJwtSecret || !authJwtTime)
          throw new ApiError({
            name: 'CONFIGURATION_ERROR',
            message:
              'Required environment variables "authJwtSecret" and/or "authJwtTime" are missing',
            status: 500,
            code: 'ERR_CFG',
          })

        const token = jwt.sign(payload, authJwtSecret, {
          expiresIn: authJwtTime,
        })

        res.setHeader('Authorization', `Bearer ${token}`)

        return res.status(200).json({
          message: 'signin successfully',
          data: payload,
        })
      } catch (err) {
        next(err)
      }
    })
  })(req, res, next)
}
