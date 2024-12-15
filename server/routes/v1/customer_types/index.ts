import express, { Router } from 'express'

import {
  listCustomerTypes,
  getCustomerType,
  createCustomerType,
  updateCustomerType,
  deleteCustomerType,
  listPagedCustomerTypes,
} from './controller'
import validateRequest from '../../../middlewares/validateRequest'
import {
  createCustomerTypeSchema,
  updateCustomerTypeSchema,
} from '../../../middlewares/requestSchemas'
import { inRoles, verifyToken } from '../../../middlewares/authJwt'

const customerTypes: Router = express.Router()

customerTypes.get('/find/all', [verifyToken, inRoles(['ADMIN'])], listCustomerTypes)
customerTypes.get('/', [verifyToken, inRoles(['ADMIN'])], listPagedCustomerTypes)
customerTypes.get('/:id', [verifyToken, inRoles(['ADMIN'])], getCustomerType)
customerTypes.post(
  '/',
  [verifyToken, inRoles(['ADMIN']), validateRequest(createCustomerTypeSchema)],
  createCustomerType,
)
customerTypes.put(
  '/:id',
  [verifyToken, inRoles(['ADMIN']), validateRequest(updateCustomerTypeSchema)],
  updateCustomerType,
)
customerTypes.delete('/:id', [verifyToken, inRoles(['ADMIN'])], deleteCustomerType)

export default customerTypes
