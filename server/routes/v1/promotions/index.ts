import express, { Router } from 'express'

import {
  listPromotions,
  getPromotion,
  createPromotion,
  updatePromotion,
  deletePromotion,
  listPromotionsPhrases,
} from './controller'
import validateRequest from '../../../middlewares/validateRequest'
import { createPromotionSchema, updatePromotionSchema } from '../../../middlewares/requestSchemas'
import { inRoles, verifyToken } from '../../../middlewares/authJwt'

const promotions: Router = express.Router()

promotions.get('/find/all', [verifyToken, inRoles(['ADMIN'])], listPromotions)
promotions.get('/', [verifyToken, inRoles(['ADMIN'])], listPromotionsPhrases)
promotions.get('/:id', [verifyToken, inRoles(['ADMIN'])], getPromotion)
promotions.post(
  '/',
  [verifyToken, inRoles(['ADMIN']), validateRequest(createPromotionSchema)],
  createPromotion,
)
promotions.put(
  '/:id',
  [verifyToken, inRoles(['ADMIN']), validateRequest(updatePromotionSchema)],
  updatePromotion,
)
promotions.delete('/:id', [verifyToken, inRoles(['ADMIN'])], deletePromotion)

export default promotions
