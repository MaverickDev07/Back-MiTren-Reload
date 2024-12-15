import { NextFunction, Request, Response } from 'express'
import LineResource from '../../../resources/LineResource'
import LineRepository from '../../../repositories/LineRepository'
import ApiError from '../../../errors/ApiError'

export const listLines = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const repository = new LineRepository()
    const lines = LineResource.collection(
      await repository.getAll({
        sortBy: req.query.sort_by as string,
        filterBy: req.query.filter_by as string,
      }),
    )
    res.status(200).json({ lines })
  } catch (error: any) {
    next(error)
  }
}

export const listLinePhrases = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const repository = new LineRepository()

    const limit = req.query.limit ? +req.query.limit : 10
    const page = req.query.page ? +req.query.page : 1
    const sortBy = req.query.sort_by as string
    const filterBy = req.query.filter_by as string

    if (isNaN(limit) || isNaN(page)) {
      throw new ApiError({
        name: 'INVALID_DATA_ERROR',
        message: 'Los parámetros de paginación deben ser números enteros',
        status: 422,
        code: 'ERR_INV',
      })
    }

    const linePaged = LineResource.paged(
      await repository.getPaged({
        limit,
        page,
        sortBy,
        filterBy,
      }),
    )

    res.status(200).json({ linePaged })
  } catch (error: any) {
    next(error)
  }
}

export const getLine = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const repository = new LineRepository()
    const lineResource = new LineResource(await repository.getById(req.params.id))
    res.status(200).json({ line: lineResource.item() })
  } catch (error: any) {
    next(error)
  }
}

export const createLine = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const repository = new LineRepository()
    const lineResource = new LineResource(await repository.create(req.body))
    res.status(201).json({ line: lineResource.item() })
  } catch (error) {
    next(error)
  }
}

export const updateLine = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const repository = new LineRepository()
    const lineResource = new LineResource(await repository.update(req.params.id, req.body))
    res.status(200).json({ line: lineResource.item() })
  } catch (error) {
    next(error)
  }
}

export const deleteLine = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const repository = new LineRepository()
    await repository.delete(req.params.id)

    res.status(204).send()
  } catch (error) {
    next(error)
  }
}
