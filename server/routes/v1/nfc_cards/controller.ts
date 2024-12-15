import { NextFunction, Request, Response } from 'express'
import NfcCardResource from '../../../resources/NfcCardResource'
import NfcCardRepository from '../../../repositories/NfcCardRepository'
import ApiError from '../../../errors/ApiError'

export const listNfcCards = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const repository = new NfcCardRepository()
    const nfcCards = NfcCardResource.collection(
      await repository.getAll({
        sortBy: req.query.sort_by as string,
        filterBy: req.query.filter_by as string,
      }),
    )
    res.status(200).json({ nfcCards })
  } catch (error: any) {
    next(error)
  }
}

export const listPagedNfcCards = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const repository = new NfcCardRepository()

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

    const nfcCardPaged = NfcCardResource.paged(
      await repository.getPaged({
        limit,
        page,
        sortBy,
        filterBy,
      }),
    )

    res.status(200).json({ nfcCardPaged })
  } catch (error: any) {
    next(error)
  }
}

export const getNfcCard = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const repository = new NfcCardRepository()
    const nfcCardResource = new NfcCardResource(await repository.getById(req.params.id))
    res.status(200).json({ nfcCard: nfcCardResource.item() })
  } catch (error: any) {
    next(error)
  }
}

export const createNfcCard = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const repository = new NfcCardRepository()
    const nfcCardResource = new NfcCardResource(await repository.create(req.body))
    res.status(201).json({ nfcCard: nfcCardResource.item() })
  } catch (error) {
    next(error)
  }
}

export const updateNfcCard = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const repository = new NfcCardRepository()
    const nfcCardResource = new NfcCardResource(await repository.update(req.params.id, req.body))
    res.status(200).json({ nfcCard: nfcCardResource.item() })
  } catch (error) {
    next(error)
  }
}

export const deleteNfcCard = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const repository = new NfcCardRepository()
    await repository.delete(req.params.id)

    res.status(204).send()
  } catch (error) {
    next(error)
  }
}
