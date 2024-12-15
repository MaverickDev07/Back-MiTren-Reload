import express, { Router } from 'express'

import {
  listPhrases,
  getPhrase,
  createPhrase,
  updatePhrase,
  deletePhrase,
  listPagedPhrases,
} from './controller'
import validateRequest from '../../../middlewares/validateRequest'
import { createPhraseSchema, updatePhraseSchema } from '../../../middlewares/requestSchemas'
import { inRoles, verifyToken } from '../../../middlewares/authJwt'

const phrases: Router = express.Router()

phrases.get('/find/all', [verifyToken, inRoles(['ADMIN'])], listPhrases)
phrases.get('/', [verifyToken, inRoles(['ADMIN'])], listPagedPhrases)
phrases.get('/:id', [verifyToken, inRoles(['ADMIN'])], getPhrase)
phrases.post(
  '/',
  [verifyToken, inRoles(['ADMIN']), validateRequest(createPhraseSchema)],
  createPhrase,
)
phrases.put(
  '/:id',
  [verifyToken, inRoles(['ADMIN']), validateRequest(updatePhraseSchema)],
  updatePhrase,
)
phrases.delete('/:id', [verifyToken, inRoles(['ADMIN'])], deletePhrase)

export default phrases
