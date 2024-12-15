import express, { Router } from 'express'

import {
  listNfcTransactions,
  getNfcTransaction,
  createNfcTransaction,
  updateNfcTransaction,
  deleteNfcTransaction,
} from './controller'
import validateRequest from '../../../middlewares/validateRequest'
import {
  createNfcTransactionSchema,
  updateNfcTransactionSchema,
} from '../../../middlewares/requestSchemas'

const nfcTransactions: Router = express.Router()

nfcTransactions.get('/', listNfcTransactions)
nfcTransactions.get('/:id', getNfcTransaction)
nfcTransactions.post('/', validateRequest(createNfcTransactionSchema), createNfcTransaction)
nfcTransactions.put('/:id', validateRequest(updateNfcTransactionSchema), updateNfcTransaction)
nfcTransactions.delete('/:id', deleteNfcTransaction)

export default nfcTransactions
