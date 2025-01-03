import express, { Router } from 'express'
import { verifyTicket, getVerificationHistory, getVerificationStats } from './controller'
import { verifyToken, inRoles } from '../../../middlewares/authJwt'
import validateRequest from '../../../middlewares/validateRequest'
import { verifyTicketSchema } from '../../../middlewares/requestSchemas'

const verifier: Router = express.Router()

// Rutas protegidas solo para rol BOLETERO
verifier.post(
  '/verify',
  [verifyToken, inRoles(['BOLETERO']), validateRequest(verifyTicketSchema)],
  verifyTicket
)

verifier.get(
  '/history',
  [verifyToken, inRoles(['BOLETERO'])],
  getVerificationHistory
)

verifier.get(
  '/stats',
  [verifyToken, inRoles(['BOLETERO'])],
  getVerificationStats
)

export default verifier