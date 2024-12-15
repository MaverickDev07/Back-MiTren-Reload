import express, { Router } from 'express'
import { authUser } from './controller'

const auth: Router = express.Router()

auth.post('/signin', authUser)

export default auth
