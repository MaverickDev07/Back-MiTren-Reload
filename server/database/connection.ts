import { connect } from 'mongoose'
import Debug from 'debug'

import EnvManager from '../config/EnvManager'

process.env.DEBUG_COLORS = 'true'

const debug = Debug('app:database')
const dError = Debug('app:error')
dError.color = '1'

async function testConnection() {
  try {
    // console.log(EnvManager.getDbConnectionUrl())
    await connect(EnvManager.getDbConnectionUrl())

    debug('Connection has been established successfully.')
  } catch (error) {
    dError(`Unable to connect to the database: ${error}`)
  }
}

testConnection()
