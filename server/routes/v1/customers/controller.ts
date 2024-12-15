import { NextFunction, Request, Response } from 'express'
import CustomerResource from '../../../resources/CustomerResource'
import CustomerRepository from '../../../repositories/CustomerRepository'

export const listCustomers = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const repository = new CustomerRepository()
    const customers = CustomerResource.collection(
      await repository.getAll({
        sortBy: req.query.sort_by as string,
        filterBy: req.query.filter_by as string,
      }),
    )
    res.status(200).json({ customers })
  } catch (error: any) {
    next(error)
  }
}

export const getCustomer = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const repository = new CustomerRepository()
    const customerResource = new CustomerResource(await repository.getById(req.params.id))
    res.status(200).json({ customer: customerResource.item() })
  } catch (error: any) {
    next(error)
  }
}

export const createCustomer = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const repository = new CustomerRepository()
    const customerResource = new CustomerResource(await repository.create(req.body))
    res.status(201).json({ customer: customerResource.item() })
  } catch (error) {
    next(error)
  }
}

export const updateCustomer = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const repository = new CustomerRepository()
    const customerResource = new CustomerResource(await repository.update(req.params.id, req.body))
    res.status(200).json({ customer: customerResource.item() })
  } catch (error) {
    next(error)
  }
}

export const deleteCustomer = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const repository = new CustomerRepository()
    await repository.delete(req.params.id)

    res.status(204).send()
  } catch (error) {
    next(error)
  }
}
