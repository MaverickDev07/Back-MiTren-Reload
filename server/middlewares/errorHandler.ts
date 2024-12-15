import { NextFunction, Request, Response } from 'express'
import Joi from 'joi'

import ApiError from '../errors/ApiError'

/* eslint-disable max-params */
export default function errorHandler(
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction,
) {
  if (res.headersSent) {
    return next(error)
  }

  if (Joi.isError(error)) {
    const validationError: ValidationError = {
      error: {
        name: 'VALIDATION_ERROR',
        message: 'Validation error',
        code: 'ERR_VALID',
        errors: error.details.map(item => ({
          message: item.message,
        })),
      },
      code_response: 0,
    }
    return res.status(423).json(validationError)
  }
  if (error.name === 'TokenExpiredError') {
    error = new ApiError({
      name: 'TOKEN_EXPIRED_ERROR',
      message: 'The authorization token has expired.',
      code: 'ERR_TE',
      status: 401,
    })
  }

  if (error instanceof ApiError) {
    return res.status(error.status).json({
      error: {
        name: error.name,
        message: error.message,
        code: error.code,
      },
      code_response: 0,
    })
  }

  if (process.env.NODE_ENV === 'development') {
    // Manejo para otros tipos de errores
    return res.status(500).json({
      error: {
        code: 'ERR_UNKNOWN',
        message: error.message,
        stack: error.stack, // Incluye el stack trace para facilitar la depuración
      },
      code_response: 0,
    })
  } else {
    if (process.env.NODE_ENV !== 'test') {
      console.log(error)
    }

    res.status(500).json({
      error: {
        code: 'ERR_UNKNOWN',
        message: error.message || 'An error occurred. Please view logs for more details',
      },
      code_response: 0,
    })
  }
}
/* eslint-enable max-params */
