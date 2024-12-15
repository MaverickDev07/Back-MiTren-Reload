import { NextFunction, Request, Response } from 'express'
import MethodResource from '../../../resources/MethodResource'
import MethodRepository from '../../../repositories/MethodRepository'

export const listMethods = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const repository = new MethodRepository()
    const methods = MethodResource.collection(
      await repository.getAll({
        sortBy: req.query.sort_by as string,
        filterBy: req.query.filter_by as string,
      }),
    )
    res.status(200).json({ methods })
  } catch (error: any) {
    next(error)
  }
}

export const getMethod = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const repository = new MethodRepository()
    const methodResource = new MethodResource(await repository.getById(req.params.id))
    res.status(200).json({ method: methodResource.item() })
  } catch (error: any) {
    next(error)
  }
}

export const createMethod = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const repository = new MethodRepository()
    const methodResource = new MethodResource(await repository.create(req.body))
    res.status(201).json({ method: methodResource.item() })
  } catch (error) {
    next(error)
  }
}

export const updateMethod = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const repository = new MethodRepository()
    const methodResource = new MethodResource(await repository.update(req.params.id, req.body))
    res.status(200).json({ method: methodResource.item() })
  } catch (error) {
    next(error)
  }
}

export const deleteMethod = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const repository = new MethodRepository()
    await repository.delete(req.params.id)

    res.status(204).send()
  } catch (error) {
    next(error)
  }
}
