import express, { Router } from 'express'
import veripagos from './veripagos'
import lines from './lines'
import stations from './stations'
import routes from './routes'
import kiosks from './kiosks'
import methods from './methods'
import customerTypes from './customer_types'
import customers from './customers'
import nfcCards from './nfc_cards'
import nfcTransactions from './nfc_transactions'
import promotions from './promotions'
import users from './users'
import prices from './prices'
import tickets from './tickets'
import wallets from './wallets'
import ticketFlow from './ticket_flow'
import auth from './auth'
import phrases from './phrases'

const v1: Router = express.Router()

v1.use('/qr', veripagos)
v1.use('/lines', lines)
v1.use('/stations', stations)
v1.use('/routes', routes)
v1.use('/kiosks', kiosks)
v1.use('/methods', methods)
v1.use('/customer_types', customerTypes)
v1.use('/customers', customers)
v1.use('/phrases', phrases)
v1.use('/nfc_cards', nfcCards)
v1.use('/nfc_transactions', nfcTransactions)
v1.use('/promotions', promotions)
v1.use('/users', users)
v1.use('/prices', prices)
v1.use('/tickets', tickets)
v1.use('/wallets', wallets)
v1.use('/ticket_flow', ticketFlow)
v1.use('/auth', auth)

export default v1
