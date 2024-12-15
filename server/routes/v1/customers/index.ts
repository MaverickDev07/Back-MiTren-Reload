import express, { Router } from 'express'

import {
  listCustomers,
  getCustomer,
  createCustomer,
  updateCustomer,
  deleteCustomer,
} from './controller'
import validateRequest from '../../../middlewares/validateRequest'
import { createCustomerSchema, updateCustomerSchema } from '../../../middlewares/requestSchemas'

const customers: Router = express.Router()

customers.get('/', listCustomers)
customers.get('/:id', getCustomer)
customers.post('/', validateRequest(createCustomerSchema), createCustomer)
customers.put('/:id', validateRequest(updateCustomerSchema), updateCustomer)
customers.delete('/:id', deleteCustomer)

export default customers
