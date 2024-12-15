import { NextFunction, Response } from 'express'

export const addCreatedByUser = async (req: any, res: Response, next: NextFunction) => {
  try {
    req.body.user = {
      user_id: req.user.id,
      fullname: req.user.fullname,
    }

    next()
  } catch (error) {
    next(error)
  }
}
