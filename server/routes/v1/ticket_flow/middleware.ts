/* eslint-disable max-lines */
import { NextFunction, Request, Response } from 'express'

import Kiosk from '../../../database/models/Kiosk'
import ApiError from '../../../errors/ApiError'
import VeripagosService from '../../../utils/VeripagosService'
import EnvManager from '../../../config/EnvManager'

const veripagosService = new VeripagosService(
  'https://veripagos.com/api',
  EnvManager.getCredentialQR(),
)

export const getKioskIdByEnv = (req: Request, res: Response, next: NextFunction) => {
  try {
    const kioskId = EnvManager.getKioskId()
    if (!kioskId)
      throw new ApiError({
        name: 'CONFIGURATION_ERROR',
        message: 'Required environment variable "kiosId" is missing or not defined',
        status: 500,
        code: 'ERR_CFG',
      })
    req.params.id = EnvManager.kioskId()

    next()
  } catch (error: any) {
    next(error)
  }
}
export const preloadVeripagosData = (req: Request, res: Response, next: NextFunction) => {
  try {
    const kioskId = EnvManager.getKioskId()
    const { body } = req
    if (!kioskId)
      throw new ApiError({
        name: 'NOT_FOUND_ERROR',
        message: 'KioskId not found',
        status: 404,
        code: 'ERR_NF',
      })
    const now = new Date()
    const day = now.getDate().toString().padStart(2, '0')
    const month = (now.getMonth() + 1).toString().padStart(2, '0') // Los meses van de 0 a 11, por eso se suma 1
    const year = now.getFullYear()

    const currentDate = `${day}-${month}-${year}`

    const hours = now.getHours().toString().padStart(2, '0')
    const minutes = now.getMinutes().toString().padStart(2, '0')
    const seconds = now.getSeconds().toString().padStart(2, '0')

    const currentTime = `${hours}:${minutes}:${seconds}`

    req.body = {
      ...req.body,
      data: [
        'kiosk_id',
        kioskId,
        'fecha',
        currentDate,
        'hora',
        currentTime,
        'desde',
        body.start_station,
        'hasta',
        body.end_station,
      ],
      vigencia: '0/00:15',
      uso_unico: true,
      detalle: `Pago ticket: hasta ${body.end_station}`,
    }

    next()
  } catch (error: any) {
    next(error)
  }
}
export const computeTotalPrice = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { prices } = req.body
    const kioskId = EnvManager.getKioskId()
    if (!kioskId)
      throw new ApiError({
        name: 'NOT_FOUND_ERROR',
        message: 'KioskId not found',
        status: 400,
        code: 'ERR_NF',
      })
    const kiosk = await Kiosk.findById(kioskId)
    if (!kiosk)
      throw new ApiError({
        name: 'MODEL_NOT_FOUND_ERROR',
        message: 'Kiosk not found',
        status: 400,
        code: 'ERR_MNF',
      })
    const totalPrice = prices.reduce((acc: number, price: any) => {
      return acc + price.qty * price.base_price
    }, 0)

    req.body.kiosk_code = kiosk.kiosk_code
    req.body.total_price = totalPrice

    next()
  } catch (error) {
    next(error)
  }
}
export const validatePrices = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { total_price, payment_method } = req.body
    if (payment_method?.method_name === 'PQR') {
      const { method_id } = payment_method

      const response = await veripagosService.verifyQrStatus({
        secret_key: EnvManager.getQrKey(),
        movimiento_id: method_id,
      })

      if (response?.Codigo === 1 || response?.Data?.estado !== 'Completado')
        throw new ApiError({
          name: 'INVALID_DATA_ERROR',
          message: 'Código QR error id',
          status: 422,
          code: 'ERR_INV',
        })

      if (response?.Data?.monto !== total_price)
        throw new ApiError({
          name: 'INVALID_DATA_ERROR',
          message: 'El pago por QR no coincide con el precio total del ticket',
          status: 422,
          code: 'ERR_INV',
        })
    }

    next()
  } catch (error: any) {
    next(error)
  }
}
