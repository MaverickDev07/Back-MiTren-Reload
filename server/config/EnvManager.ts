import dotenv from 'dotenv'
import { studlyCaseToSnakeCase } from '../utils/functions'

dotenv.config()

class EnvManager {
  [x: string]: any
  getDbConnectionUrl() {
    const USER = encodeURIComponent(process.env.DB_USERNAME)
    const PASSWORD = encodeURIComponent(process.env.DB_PASSWORD)
    return `mongodb://${USER}:${PASSWORD}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}?authMechanism=DEFAULT`
  }
  getCredentialQR() {
    const USER = process.env.QR_USERNAME
    const PASSWORD = process.env.QR_PASSWORD

    return Buffer.from(`${USER}:${PASSWORD}`).toString('base64')
  }
}
const envManager = new EnvManager()

export default new Proxy(envManager, {
  get(envManager: EnvManager, field: string) {
    return function (defaultValue?: string | number | boolean) {
      if (field in envManager) {
        // if method exists on envManager (getDbConnectionUrl)
        return envManager[field](defaultValue)
      }
      let envVariable: string | number | undefined =
        process.env[studlyCaseToSnakeCase(field.replace('get', ''))]

      if (envVariable && /^true$/i.test(envVariable)) {
        return true
      }

      if (envVariable && /^false$/i.test(envVariable)) {
        return false
      }

      // Check if the value is fully numeric before converting to number
      if (envVariable && /^[0-9]+$/.test(envVariable)) {
        envVariable = parseInt(envVariable, 10)
      }

      return envVariable || defaultValue
    }
  },
})
