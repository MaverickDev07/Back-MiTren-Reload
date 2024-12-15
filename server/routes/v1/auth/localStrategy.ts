import { Strategy } from 'passport-local'

import UserRepository from '../../../repositories/UserRepository'
import UserResource from '../../../resources/UserResource'
import ApiError from '../../../errors/ApiError'

const localStrategy = new Strategy(
  {
    session: false,
  },
  async function (username, password, done) {
    try {
      const repository = new UserRepository()
      const userFound = await repository.getAuthByDocNumber(username)

      if (!userFound)
        throw new ApiError({
          name: 'UNAUTHORIZED_ERROR',
          message: 'Usuario o Contraseña Incorrecto.',
          status: 401,
          code: 'ERR_UNAUTH',
        })

      const matchPassword = await repository.comparePassword(password, userFound?.password)

      if (!matchPassword)
        throw new ApiError({
          name: 'UNAUTHORIZED_ERROR',
          message: 'Usuario o Contraseña Incorrecto.',
          status: 401,
          code: 'ERR_UNAUTH',
        })

      const userResource = new UserResource(userFound)

      return done(null, userResource.item())
    } catch (error) {
      return done(error)
    }
  },
)

export default localStrategy
