import { NextFunction, Request, Response } from 'express'
import PriceResource from '../../../resources/PriceResource'
import PriceRepository from '../../../repositories/PriceRepository'

export const listPrices = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const repository = new PriceRepository()
    const prices = PriceResource.collection(
      await repository.getAll({
        sortBy: req.query.sort_by as string,
        filterBy: req.query.filter_by as string,
      }),
    )
    res.status(200).json({ prices })
  } catch (error: any) {
    next(error)
  }
}

export const getPricesByLine = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const repository = new PriceRepository()
    const prices = await repository.getByLineId(req.params.id)
    res.status(200).json({ prices })
  } catch (error: any) {
    next(error)
  }
}

export const getPrice = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const repository = new PriceRepository()
    const priceResource = new PriceResource(await repository.getById(req.params.id))
    res.status(200).json({ price: priceResource.item() })
  } catch (error: any) {
    next(error)
  }
}

export const getPriceByLine = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const repository = new PriceRepository()
    const listPrice = await repository.getByLineId(req.params.id)
    res.status(200).json({ listPrice })
  } catch (error: any) {
    next(error)
  }
}

export const createPrice = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const repository = new PriceRepository()
    const priceResource = new PriceResource(await repository.create(req.body))
    res.status(201).json({ price: priceResource.item() })
  } catch (error) {
    next(error)
  }
}

export const updatePrice = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const repository = new PriceRepository()
    const priceResource = new PriceResource(await repository.update(req.params.id, req.body))
    res.status(200).json({ price: priceResource.item() })
  } catch (error) {
    next(error)
  }
}

export const createOrUpdatePriceByRange = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { start_station_id, end_station_id } = req.params
    const repository = new PriceRepository()
    const result = await repository.createOrUpdatePrices(
      start_station_id as string,
      end_station_id as string,
      req.body,
    )
    res.status(200).json(result)
  } catch (error: any) {
    next(error)
  }
}

export const deletePrice = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const repository = new PriceRepository()
    await repository.delete(req.params.id)

    res.status(204).send()
  } catch (error) {
    next(error)
  }
}
