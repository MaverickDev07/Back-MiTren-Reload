import { NextFunction, Request, Response } from 'express'
import UserResource from '../../../resources/UserResource'
import UserRepository from '../../../repositories/UserRepository'
import ApiError from '../../../errors/ApiError'

export const listUsers = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const repository = new UserRepository()
    const users = UserResource.collection(
      await repository.getAll({
        sortBy: req.query.sort_by as string,
        filterBy: req.query.filter_by as string,
      }),
    )
    res.status(200).json({ users })
  } catch (error: any) {
    next(error)
  }
}

export const listPagedUsers = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const repository = new UserRepository()

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

    const userPaged = UserResource.paged(
      await repository.getPaged({
        limit,
        page,
        sortBy,
        filterBy,
      }),
    )

    res.status(200).json({ userPaged })
  } catch (error: any) {
    next(error)
  }
}

export const getUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const repository = new UserRepository()
    const userResource = new UserResource(await repository.getById(req.params.id))
    res.status(200).json({ user: userResource.item() })
  } catch (error: any) {
    next(error)
  }
}

export const createUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const repository = new UserRepository()
    const userResource = new UserResource(await repository.create(req.body))
    res.status(201).json({ user: userResource.item() })
  } catch (error) {
    next(error)
  }
}

export const updateUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const repository = new UserRepository()
    const userResource = new UserResource(await repository.update(req.params.id, req.body))
    res.status(200).json({ user: userResource.item() })
  } catch (error) {
    next(error)
  }
}

export const updatePasswordUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const repository = new UserRepository()
    const userResource = new UserResource(
      await repository.updatePasswordByUserId(req.params.id, req.body),
    )
    res.status(200).json({ user: userResource.item() })
  } catch (error) {
    next(error)
  }
}

export const deleteUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const repository = new UserRepository()
    await repository.delete(req.params.id)

    res.status(204).send()
  } catch (error) {
    next(error)
  }
}
