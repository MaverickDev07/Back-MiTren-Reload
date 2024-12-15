import { NextFunction, Request, Response } from 'express'

import StationResource from '../../../resources/StationResource'
import StationRepository from '../../../repositories/StationRepository'
import ApiError from '../../../errors/ApiError'

export const listStations = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const repository = new StationRepository()
    const stations = StationResource.collection(
      await repository.getAll({
        sortBy: req.query.sort_by as string,
        filterBy: req.query.filter_by as string,
      }),
    )

    res.status(200).json({ stations })
  } catch (error) {
    next(error)
  }
}

export const listPagedStations = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const repository = new StationRepository()

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

    const stationPaged = StationResource.paged(
      await repository.getPaged({
        limit,
        page,
        sortBy,
        filterBy,
      }),
    )

    res.status(200).json({ stationPaged })
  } catch (error: any) {
    next(error)
  }
}

export const getStation = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const repository = new StationRepository()
    const stationResource = new StationResource(await repository.getById(req.params.id))
    res.status(200).json({ station: stationResource.item() })
  } catch (error: any) {
    next(error)
  }
}

export const createStation = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const repository = new StationRepository()
    const stationResource = new StationResource(await repository.create(req.body))
    res.status(201).json({ station: stationResource.item() })
  } catch (error) {
    next(error)
  }
}

export const updateStation = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const repository = new StationRepository()
    const stationResource = new StationResource(await repository.update(req.params.id, req.body))
    res.status(200).json({ station: stationResource.item() })
  } catch (error) {
    next(error)
  }
}

export const deleteStation = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const repository = new StationRepository()
    await repository.delete(req.params.id)

    res.status(204).send()
  } catch (error) {
    next(error)
  }
}
