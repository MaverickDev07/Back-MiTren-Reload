import { NextFunction, Request, Response } from 'express'
import PromotionResource from '../../../resources/PromotionResource'
import PromotionRepository from '../../../repositories/PromotionRepository'
import ApiError from '../../../errors/ApiError'

export const listPromotions = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const repository = new PromotionRepository()
    const promotions = PromotionResource.collection(
      await repository.getAll({
        sortBy: req.query.sort_by as string,
        filterBy: req.query.filter_by as string,
      }),
    )
    res.status(200).json({ promotions })
  } catch (error: any) {
    next(error)
  }
}

export const listPromotionsPhrases = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const repository = new PromotionRepository()

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

    const promotionPaged = PromotionResource.paged(
      await repository.getPaged({
        limit,
        page,
        sortBy,
        filterBy,
      }),
    )

    res.status(200).json({ promotionPaged })
  } catch (error: any) {
    next(error)
  }
}

export const getPromotion = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const repository = new PromotionRepository()
    const promotionResource = new PromotionResource(await repository.getById(req.params.id))
    res.status(200).json({ promotion: promotionResource.item() })
  } catch (error: any) {
    next(error)
  }
}

export const createPromotion = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const repository = new PromotionRepository()
    const promotionResource = new PromotionResource(await repository.create(req.body))
    res.status(201).json({ promotion: promotionResource.item() })
  } catch (error) {
    next(error)
  }
}

export const updatePromotion = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const repository = new PromotionRepository()
    const promotionResource = new PromotionResource(
      await repository.update(req.params.id, req.body),
    )
    res.status(200).json({ promotion: promotionResource.item() })
  } catch (error) {
    next(error)
  }
}

export const deletePromotion = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const repository = new PromotionRepository()
    await repository.delete(req.params.id)

    res.status(204).send()
  } catch (error) {
    next(error)
  }
}
