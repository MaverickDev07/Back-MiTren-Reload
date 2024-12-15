import { NextFunction, Request, Response } from 'express'
import PhraseResource from '../../../resources/PhraseResource'
import PhraseRepository from '../../../repositories/PhraseRepository'
import ApiError from '../../../errors/ApiError'

export const listPhrases = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const repository = new PhraseRepository()
    const phrases = PhraseResource.collection(
      await repository.getAll({
        sortBy: req.query.sort_by as string,
        filterBy: req.query.filter_by as string,
      }),
    )
    res.status(200).json({ phrases })
  } catch (error: any) {
    next(error)
  }
}

export const listPagedPhrases = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const repository = new PhraseRepository()

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

    const phrasePaged = PhraseResource.paged(
      await repository.getPaged({
        limit,
        page,
        sortBy,
        filterBy,
      }),
    )

    res.status(200).json({ phrasePaged })
  } catch (error: any) {
    next(error)
  }
}

export const getPhrase = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const repository = new PhraseRepository()
    const phraseResource = new PhraseResource(await repository.getById(req.params.id))
    res.status(200).json({ phrase: phraseResource.item() })
  } catch (error: any) {
    next(error)
  }
}

export const createPhrase = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const repository = new PhraseRepository()
    const phraseResource = new PhraseResource(await repository.create(req.body))
    res.status(201).json({ phrase: phraseResource.item() })
  } catch (error) {
    next(error)
  }
}

export const updatePhrase = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const repository = new PhraseRepository()
    const phraseResource = new PhraseResource(await repository.update(req.params.id, req.body))
    res.status(200).json({ phrase: phraseResource.item() })
  } catch (error) {
    next(error)
  }
}

export const deletePhrase = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const repository = new PhraseRepository()
    await repository.delete(req.params.id)

    res.status(204).send()
  } catch (error) {
    next(error)
  }
}
