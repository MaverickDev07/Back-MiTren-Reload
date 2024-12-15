import express, { Router } from 'express'

import {
  listPrices,
  getPrice,
  getPriceByLine,
  createPrice,
  updatePrice,
  deletePrice,
  createOrUpdatePriceByRange,
} from './controller'
import validateRequest from '../../../middlewares/validateRequest'
import { createPriceSchema, updatePriceSchema } from '../../../middlewares/requestSchemas'

const prices: Router = express.Router()

prices.get('/', listPrices)
prices.get('/:id', getPrice)
prices.get('/line_id/:id', getPriceByLine)
prices.post('/', validateRequest(createPriceSchema), createPrice)
prices.put('/:id', validateRequest(updatePriceSchema), updatePrice)
prices.post('/range/:start_station_id/:end_station_id', createOrUpdatePriceByRange)
prices.delete('/:id', deletePrice)

export default prices
