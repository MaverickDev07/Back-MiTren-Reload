import express, { Router } from 'express'

import {
  createTicket,
  estadoPagoController,
  generateQR,
  getStationByKioskId,
  listLinesByActive,
  listMethodsByActivate,
  listPagedStationsByLine,
  listPricesByStationPair,
  processPaymentPOS,
  recibirMonto,
  verifyQrStatus,
} from './controller'
import validateRequest from '../../../middlewares/validateRequest'
import { createTicketSchema } from '../../../middlewares/requestSchemas'
import { computeTotalPrice, getKioskIdByEnv, preloadVeripagosData, verifyPaymentStatus } from './middleware'

const ticketFlow: Router = express.Router()
ticketFlow.get('/step-1/lines', listLinesByActive)
ticketFlow.get('/step-2/line/:id', listPagedStationsByLine)
ticketFlow.get('/step-2/env-id/station', [getKioskIdByEnv], getStationByKioskId)
ticketFlow.get('/step-3/:start_station_id/:end_station_id', listPricesByStationPair)
ticketFlow.get('/step-4/methods', listMethodsByActivate)

// Method PagosQR
ticketFlow.post('/step-4/pqr/generate', [preloadVeripagosData], generateQR)
ticketFlow.post('/step-4/pqr/verify', verifyQrStatus)

// Rutas para pagos POS generales
ticketFlow.post('/pos/payments', processPaymentPOS);


// Definir las rutas y asociarlas con los métodos del controlador
ticketFlow.post('/efectivo/monto', recibirMonto);
ticketFlow.get('/efectivo/estado', estadoPagoController); 

// Save TICKET
ticketFlow.post(
  '/step-6/ticket',
  [
    validateRequest(createTicketSchema),
    verifyPaymentStatus,  // Aquí verificamos el pago
    computeTotalPrice
  ],
  createTicket
);


export default ticketFlow