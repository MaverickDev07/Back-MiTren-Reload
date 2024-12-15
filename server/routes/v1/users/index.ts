import express, { Router } from 'express'

import {
  listUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser,
  updatePasswordUser,
  listPagedUsers,
} from './controller'
import validateRequest from '../../../middlewares/validateRequest'
import {
  createUserSchema,
  updatePasswordUserSchema,
  updateUserSchema,
} from '../../../middlewares/requestSchemas'
import { inRoles, verifyToken } from '../../../middlewares/authJwt'

const users: Router = express.Router()

users.get('/find/all', [verifyToken, inRoles(['ADMIN'])], listUsers)
users.get('/', [verifyToken, inRoles(['ADMIN'])], listPagedUsers)
users.get('/:id', [verifyToken, inRoles(['ADMIN'])], getUser)
users.post('/', [verifyToken, inRoles(['ADMIN']), validateRequest(createUserSchema)], createUser)
users.put('/:id', [verifyToken, inRoles(['ADMIN']), validateRequest(updateUserSchema)], updateUser)
users.put(
  '/:id/password',
  [verifyToken, inRoles(['ADMIN']), validateRequest(updatePasswordUserSchema)],
  updatePasswordUser,
)
users.delete('/:id', [verifyToken, inRoles(['ADMIN'])], deleteUser)

export default users
