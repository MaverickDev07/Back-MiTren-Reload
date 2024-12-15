import express, { Router, NextFunction, Request, Response } from 'express'
import { generateQR, verifyQrStatus } from './controller'
import EnvManager from '../../../config/EnvManager'
import ApiError from '../../../errors/ApiError'
// import validateRequest from '../../../middlewares/validateRequest'

const veripagos: Router = express.Router()

const preloadVeripagosData = (req: Request, res: Response, next: NextFunction) => {
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
      vigencia: '0/00:05',
      uso_unico: true,
      detalle: `Pago ticket: hasta ${body.end_station}`,
    }

    next()
  } catch (error: any) {
    next(error)
  }
}

veripagos.post('/generate', [preloadVeripagosData], generateQR)
veripagos.post('/verify', verifyQrStatus)

export default veripagos
