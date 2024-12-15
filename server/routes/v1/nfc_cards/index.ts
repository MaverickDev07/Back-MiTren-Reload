import express, { Router } from 'express'

import {
  listNfcCards,
  getNfcCard,
  createNfcCard,
  updateNfcCard,
  deleteNfcCard,
  listPagedNfcCards,
} from './controller'
import validateRequest from '../../../middlewares/validateRequest'
import { createNfcCardSchema, updateNfcCardSchema } from '../../../middlewares/requestSchemas'
import { inRoles, verifyToken } from '../../../middlewares/authJwt'
import { addCreatedByUser } from './middleware'

const nfcCards: Router = express.Router()

nfcCards.get('/find/all', [verifyToken, inRoles(['ADMIN'])], listNfcCards)
nfcCards.get('/', [verifyToken, inRoles(['ADMIN'])], listPagedNfcCards)
nfcCards.get('/:id', [verifyToken, inRoles(['ADMIN'])], getNfcCard)
nfcCards.post(
  '/',
  [verifyToken, inRoles(['ADMIN']), addCreatedByUser, validateRequest(createNfcCardSchema)],
  createNfcCard,
)
nfcCards.put(
  '/:id',
  [verifyToken, inRoles(['ADMIN'])],
  validateRequest(updateNfcCardSchema),
  updateNfcCard,
)
nfcCards.delete('/:id', [verifyToken, inRoles(['ADMIN'])], deleteNfcCard)

export default nfcCards
