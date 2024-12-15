import { NextFunction, Request, Response } from 'express'
import NfcTransactionResource from '../../../resources/NfcTransactionResource'
import NfcTransactionRepository from '../../../repositories/NfcTransactionRepository'

export const listNfcTransactions = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const repository = new NfcTransactionRepository()
    const nfcTransactions = NfcTransactionResource.collection(
      await repository.getAll({
        sortBy: req.query.sort_by as string,
        filterBy: req.query.filter_by as string,
      }),
    )
    res.status(200).json({ nfcTransactions })
  } catch (error: any) {
    next(error)
  }
}

export const getNfcTransaction = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const repository = new NfcTransactionRepository()
    const nfcTransactionResource = new NfcTransactionResource(
      await repository.getById(req.params.id),
    )
    res.status(200).json({ nfcTransaction: nfcTransactionResource.item() })
  } catch (error: any) {
    next(error)
  }
}

export const createNfcTransaction = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const repository = new NfcTransactionRepository()
    const nfcTransactionResource = new NfcTransactionResource(await repository.create(req.body))
    res.status(201).json({ nfcTransaction: nfcTransactionResource.item() })
  } catch (error) {
    next(error)
  }
}

export const updateNfcTransaction = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const repository = new NfcTransactionRepository()
    const nfcTransactionResource = new NfcTransactionResource(
      await repository.update(req.params.id, req.body),
    )
    res.status(200).json({ nfcTransaction: nfcTransactionResource.item() })
  } catch (error) {
    next(error)
  }
}

export const deleteNfcTransaction = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const repository = new NfcTransactionRepository()
    await repository.delete(req.params.id)

    res.status(204).send()
  } catch (error) {
    next(error)
  }
}
