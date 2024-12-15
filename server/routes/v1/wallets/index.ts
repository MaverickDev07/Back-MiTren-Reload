import express, { Router } from 'express'

import {
  listWallets,
  getWallet,
  createWallet,
  updateWallet,
  deleteWallet,
  getPriceTicket,
} from './controller'
import validateRequest from '../../../middlewares/validateRequest'
import { createWalletSchema, updateWalletSchema } from '../../../middlewares/requestSchemas'

const wallets: Router = express.Router()

wallets.get('/', listWallets)
wallets.get('/ticket/price', getPriceTicket)
wallets.get('/:id', getWallet)
wallets.post('/', validateRequest(createWalletSchema), createWallet)
wallets.put('/:id', validateRequest(updateWalletSchema), updateWallet)
wallets.delete('/:id', deleteWallet)

export default wallets
