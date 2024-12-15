import express, { Router } from 'express'

import { listMethods, getMethod, createMethod, updateMethod, deleteMethod } from './controller'
import validateRequest from '../../../middlewares/validateRequest'
import { createMethodSchema, updateMethodSchema } from '../../../middlewares/requestSchemas'

const methods: Router = express.Router()

methods.get('/', listMethods)
methods.get('/:id', getMethod)
methods.post('/', validateRequest(createMethodSchema), createMethod)
methods.put('/:id', validateRequest(updateMethodSchema), updateMethod)
methods.delete('/:id', deleteMethod)

export default methods
