import { NextFunction, Request, Response } from 'express'
import RouteResource from '../../../resources/RouteResource'
import RouteRepository from '../../../repositories/RouteRepository'
import ApiError from '../../../errors/ApiError'

export const listRoutes = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const repository = new RouteRepository()
    const routes = RouteResource.collection(
      await repository.getAll({
        sortBy: req.query.sort_by as string,
        filterBy: req.query.filter_by as string,
      }),
    )
    res.status(200).json({ routes })
  } catch (error: any) {
    next(error)
  }
}

export const listPagedRoutes = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const repository = new RouteRepository()

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

    const routePaged = RouteResource.paged(
      await repository.getPaged({
        limit,
        page,
        sortBy,
        filterBy,
      }),
    )

    res.status(200).json({ routePaged })
  } catch (error: any) {
    next(error)
  }
}

export const getRoute = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const repository = new RouteRepository()
    const routeResource = new RouteResource(await repository.getById(req.params.id))
    res.status(200).json({ route: routeResource.item() })
  } catch (error: any) {
    next(error)
  }
}

export const createRoute = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const repository = new RouteRepository()
    const routeResource = new RouteResource(await repository.create(req.body))
    res.status(201).json({ route: routeResource.item() })
  } catch (error) {
    next(error)
  }
}

export const updateRoute = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const repository = new RouteRepository()
    const routeResource = new RouteResource(await repository.update(req.params.id, req.body))
    res.status(200).json({ route: routeResource.item() })
  } catch (error) {
    next(error)
  }
}

export const deleteRoute = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const repository = new RouteRepository()
    await repository.delete(req.params.id)

    res.status(204).send()
  } catch (error) {
    next(error)
  }
}
