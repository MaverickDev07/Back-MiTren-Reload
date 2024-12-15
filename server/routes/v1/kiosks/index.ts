import express, { Router } from 'express'

import {
  listKiosks,
  getKiosk,
  createKiosk,
  updateKiosk,
  deleteKiosk,
  listPagedKiosks,
} from './controller'
import validateRequest from '../../../middlewares/validateRequest'
import { createKioskSchema, updateKioskSchema } from '../../../middlewares/requestSchemas'
import { inRoles, verifyToken } from '../../../middlewares/authJwt'

const kiosks: Router = express.Router()

kiosks.get('/find/all', [verifyToken, inRoles(['ADMIN'])], listKiosks)
kiosks.get('/', [verifyToken, inRoles(['ADMIN'])], listPagedKiosks)
kiosks.get('/:id', [verifyToken, inRoles(['ADMIN'])], getKiosk)
kiosks.post('/', [verifyToken, inRoles(['ADMIN']), validateRequest(createKioskSchema)], createKiosk)
kiosks.put(
  '/:id',
  [verifyToken, inRoles(['ADMIN']), validateRequest(updateKioskSchema)],
  updateKiosk,
)
kiosks.delete('/:id', [verifyToken, inRoles(['ADMIN'])], deleteKiosk)

export default kiosks
