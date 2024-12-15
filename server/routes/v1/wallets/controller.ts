import { Types } from 'mongoose'
import { NextFunction, Request, Response } from 'express'

import WalletResource from '../../../resources/WalletResource'
import WalletRepository from '../../../repositories/WalletRepository'

// Definimos el arreglo inicial de precios
let prices: number[] = [
  0.5, 8.5, 14.9, 6.8, 25.3, 3.2, 18.9, 4.7, 22.1, 11.4, 9.6, 15.8, 7.3, 20.2, 16.4, 5.9, 12.2,
  24.7, 10.1, 19.8, 8.1, 13.5, 6.2, 21.9, 4.8, 17.6, 9.3, 23.4, 11.7, 15.1, 7.9, 26.5, 35.7, 40.3,
  48.6, 56.9, 60.2, 74.5, 82.1, 90.7, 105.3, 112.8, 126.4, 133.9, 145.2, 158.7, 164.3, 178.6, 190.9,
  203.5, 215.7, 227.4, 240.3, 255.9, 267.1,
]

// Definimos el arreglo vacío para almacenar los precios eliminados
let pricesBuffer: number[] = []

export const listWallets = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const repository = new WalletRepository()
    const wallets = WalletResource.collection(
      await repository.getAll({
        sortBy: req.query.sort_by as string,
        filterBy: req.query.filter_by as string,
      }),
    )
    res.status(200).json({ wallets })
  } catch (error: any) {
    next(error)
  }
}

const generarNumeroAleatorio = (): number => {
  if (prices.length === 0) {
    ;[prices, pricesBuffer] = [pricesBuffer, prices]
  }
  // Generamos un índice aleatorio
  const randomIndex: number = Math.floor(Math.random() * prices.length)

  // Eliminamos el elemento en el índice aleatorio de 'prices' y lo agregamos a 'pricesBuffer'
  const result = prices.splice(randomIndex, 1)
  pricesBuffer.push(...result)

  return result[0]
}

export const getPriceTicket = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = {
      id: new Types.ObjectId().toHexString(),
      price: generarNumeroAleatorio(),
      currency: 'BOB',
      payment_methods: 'EFECTIVO',
      createdAt: new Date(),
    }

    res.status(200).json(data)
  } catch (error: any) {
    next(error)
  }
}

export const getWallet = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const repository = new WalletRepository()
    const walletResource = new WalletResource(await repository.getById(req.params.id))
    res.status(200).json({ wallet: walletResource.item() })
  } catch (error: any) {
    next(error)
  }
}

export const createWallet = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const repository = new WalletRepository()
    const walletResource = new WalletResource(await repository.create(req.body))
    const response = walletResource.item()
      ? { id: walletResource.item().id, code_response: 1 }
      : { code_response: 0 }

    res.status(201).json(response)
  } catch (error) {
    next(error)
  }
}

export const updateWallet = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const repository = new WalletRepository()
    const walletResource = new WalletResource(await repository.update(req.params.id, req.body))
    res.status(200).json({ wallet: walletResource.item() })
  } catch (error) {
    next(error)
  }
}

export const deleteWallet = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const repository = new WalletRepository()
    await repository.delete(req.params.id)

    res.status(204).send()
  } catch (error) {
    next(error)
  }
}
