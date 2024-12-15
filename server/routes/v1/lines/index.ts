import express, { Router } from 'express'

import {
  listLines,
  getLine,
  createLine,
  updateLine,
  deleteLine,
  listLinePhrases,
} from './controller'
import validateRequest from '../../../middlewares/validateRequest'
import { createLineSchema, updateLineSchema } from '../../../middlewares/requestSchemas'
import { inRoles, verifyToken } from '../../../middlewares/authJwt'

const lines: Router = express.Router()

lines.get('/find/all', [verifyToken, inRoles(['ADMIN'])], listLines)
lines.get('/', [verifyToken, inRoles(['ADMIN'])], listLinePhrases)
lines.get('/:id', [verifyToken, inRoles(['ADMIN'])], getLine)
lines.post('/', [verifyToken, inRoles(['ADMIN']), validateRequest(createLineSchema)], createLine)
lines.put('/:id', [verifyToken, inRoles(['ADMIN']), validateRequest(updateLineSchema)], updateLine)
lines.delete('/:id', [verifyToken, inRoles(['ADMIN'])], deleteLine)

export default lines
