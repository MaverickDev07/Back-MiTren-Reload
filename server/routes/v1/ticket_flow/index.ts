import express, { Router } from 'express'

import {
  createTicket,
  generateCash,
  generateQR,
  getStationByKioskId,
  stateCash,
  listLinesByActive,
  listMethodsByActivate,
  listPagedStationsByLine,
  listPricesByStationPair,
  verifyQrStatus,
} from './controller'
import validateRequest from '../../../middlewares/validateRequest'
import { createTicketSchema, generateCashSchema } from '../../../middlewares/requestSchemas'
import { computeTotalPrice, getKioskIdByEnv, preloadVeripagosData } from './middleware'

const ticketFlow: Router = express.Router()

ticketFlow.get('/step-1/lines', listLinesByActive)
ticketFlow.get('/step-2/line/:id', listPagedStationsByLine)
ticketFlow.get('/step-2/env-id/station', [getKioskIdByEnv], getStationByKioskId)
ticketFlow.get('/step-3/:start_station_id/:end_station_id', listPricesByStationPair)
ticketFlow.get('/step-4/methods', listMethodsByActivate)
// Method PagosQR
ticketFlow.post('/step-4/pqr/generate', [preloadVeripagosData], generateQR)
ticketFlow.post('/step-4/pqr/verify', verifyQrStatus)
// Method PagosEfectivo
ticketFlow.post('/step-4/cash/generate', [validateRequest(generateCashSchema)], generateCash)
ticketFlow.get('/step-4/cash/state', stateCash)

// Save TICKET
ticketFlow.post(
  '/step-6/ticket',
  [computeTotalPrice, validateRequest(createTicketSchema)], // validatePrices
  createTicket,
)

export default ticketFlow
