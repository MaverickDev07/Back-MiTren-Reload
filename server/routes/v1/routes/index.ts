import express, { Router } from 'express'

import {
  listRoutes,
  getRoute,
  createRoute,
  updateRoute,
  deleteRoute,
  listPagedRoutes,
} from './controller'
// import validateRequest from '../../../middlewares/validateRequest'
// import { createRouteSchema, updateRouteSchema } from '../../../middlewares/requestSchemas'
// import { inRoles, verifyToken } from '../../../middlewares/authJwt'

const routes: Router = express.Router()

// routes.get('/find/all', [verifyToken, inRoles(['ADMIN'])], listRoutes)
// routes.get('/', [verifyToken, inRoles(['ADMIN'])], listPagedRoutes)
// routes.get('/:id', [verifyToken, inRoles(['ADMIN'])], getRoute)
// routes.post('/', [verifyToken, inRoles(['ADMIN']), validateRequest(createRouteSchema)], createRoute)
// routes.put(
//   '/:id',
//   [verifyToken, inRoles(['ADMIN']), validateRequest(updateRouteSchema)],
//   updateRoute,
// )
// routes.delete('/:id', [verifyToken, inRoles(['ADMIN'])], deleteRoute)

routes.get('/find/all', listRoutes)
routes.get('/', listPagedRoutes)
routes.get('/:id', getRoute)
routes.post('/',  createRoute)
routes.put(
  '/:id',
  updateRoute
)
routes.delete('/:id', deleteRoute)

export default routes
