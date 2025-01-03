/* eslint-disable max-lines */
import { NextFunction, Request, Response } from 'express'
import { exec } from 'child_process'
import path from 'path'

import StationPairPricesRepository from '../../../repositories/ticket_flow/StationPairPricesRepository'
import StationPairPricesResource from '../../../resources/ticket_flow/StationPairPricesResource'
import LineRepository from '../../../repositories/LineRepository'
import LineResource from '../../../resources/LineResource'
import RouteRepository from '../../../repositories/RouteRepository'
import ApiError from '../../../errors/ApiError'
import StationResource from '../../../resources/StationResource'
import KioskRepository from '../../../repositories/KioskRepository'
import KioskResource from '../../../resources/KioskResource'
import EnvManager from '../../../config/EnvManager'
import MethodRepository from '../../../repositories/MethodRepository'
import MethodResource from '../../../resources/MethodResource'
import VeripagosService from '../../../utils/VeripagosService'
import TicketRepository from '../../../repositories/TicketRepository'
import TicketResource from '../../../resources/TicketResource'
import { createPdfBinary } from '../../../utils/LibPdf'
import { PaymentService } from '../../../repositories/ticket_flow/paymentPOS';
import { requestAmount, eventEmitter } from '../../../types/script';
import { ticketDocument } from './generatePDF'
import { UsbPrinterService } from '../../../utils/PrinterService'
import { PaymentResponse } from '../../../types/payment.types'



const veripagosService = new VeripagosService(
  'https://veripagos.com/api',
  EnvManager.getCredentialQR(),
)

export const listLinesByActive = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const repository = new LineRepository()
    const lines = LineResource.collection(await repository.getAllByActive())
    res.status(200).json({ lines })
  } catch (error: any) {
    next(error)
  }
}

export const listPagedStationsByLine = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const repository = new RouteRepository()

    // Convertir los parámetros de query a número usando Number() y proporcionar valores predeterminados
    const limit = req.query.limit ? Number(req.query.limit) : 4
    const page = req.query.page ? Number(req.query.page) : 1

    // Verificar si la conversión fue exitosa
    if (isNaN(limit) || isNaN(page)) {
      throw new ApiError({
        name: 'INVALID_DATA_ERROR',
        message: 'Los parámetros de paginación deben ser números enteros',
        status: 422,
        code: 'ERR_INV',
      })
    }

    const routePaged = StationResource.paged(
      await repository.getPagedStationsByLine({
        id: req.params.id,
        limit,
        page,
      }),
    )

    res.status(200).json({ routePaged })
  } catch (error) {
    next(error)
  }
}

export const getStationByKioskId = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const repository = new KioskRepository()
    const kioskResource = new KioskResource(await repository.getStationByKioskId(req.params.id))
    res.status(200).json({ kiosk: kioskResource.itemPopulate() })
  } catch (error: any) {
    next(error)
  }
}

export const listPricesByStationPair = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { start_station_id, end_station_id } = req.params
    const repository = new StationPairPricesRepository()
    const priceResource = new StationPairPricesResource(
      await repository.getPricesByStationPair(start_station_id as string, end_station_id as string),
    )
    res.status(200).json(priceResource.getPrices())
  } catch (error: any) {
    next(error)
  }
}

export const listMethodsByActivate = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const repository = new MethodRepository()
    const methods = MethodResource.collection(await repository.getAllByActive())
    res.status(200).json({ methods })
  } catch (error: any) {
    next(error)
  }
}

export const generateQR = async (req: Request, res: Response, next: NextFunction) => {
  const { body: data } = req

  try {
    const response = await veripagosService.generateQr({
      secret_key: EnvManager.getQrKey(),
      ...data,
    })

    res.status(200).json(response)
  } catch (error: any) {
    next(error)
  }
}

export const verifyQrStatus = async (req: Request, res: Response, next: NextFunction) => {
  const { body: data } = req

  try {
    const response = await veripagosService.verifyQrStatus({
      secret_key: EnvManager.getQrKey(),
      ...data,
    })

    const status = response.Data ? 200 : 500

    res.status(status).send(response)
  } catch (error) {
    next(error)
  }
}

export const processPaymentPOS = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { monto } = req.body;

    // Validación estricta del monto
    if (!monto || isNaN(monto) || monto <= 0 || monto > 99999.99) {
      return res.status(400).json({
        success: false,
        code: 'INVALID_AMOUNT',
        message: 'Monto inválido. Debe ser un número entre 0 y 99,999.99',
      });
    }

    const paymentService = new PaymentService();
    const payment = await paymentService.createPayment({ monto });

    const response: PaymentResponse = {
      success: true,
      payment: {
        estado: payment.estado,
        referencia: payment.referencia!,
        monto: payment.monto,
        mensaje: payment.mensaje!,
        autorizacion: payment.autorizacion
      }
    };

    res.status(201).json(response);
  } catch (error: any) {
    next(new Error(`Error procesando pago: ${error.message}`));
  }
};

let totalMonedero: number = 0;
let billetesAceptados: number[] = [];

export const recibirMonto = (req: Request, res: Response): void => {
    const { amount } = req.body;

    if (typeof amount !== 'number' || amount <= 0) {
        res.status(400).json({ message: 'Monto inválido' });
        return;
    }

    requestAmount(amount);
    eventEmitter.once('tubeStatus', (data) => {
        totalMonedero = data.total;
        billetesAceptados = data.acceptedBills;
        res.status(200).json({
            TotalMonedero: totalMonedero,
            BilletesAceptados: billetesAceptados
        });
    });
};

export const estadoPagoController = (req: Request, res: Response): void => {
  // Crear el timeout de 2 minutos (120000 ms)
  const timeout = setTimeout(() => {
      // Limpiar los event listeners antes de enviar la respuesta
      eventEmitter.removeAllListeners('paymentCompleted');
      eventEmitter.removeAllListeners('tubeStatus');
      
      if (!res.headersSent) {
          res.status(408).json({ 
            success: false,
            code: 'PAYMENT_TIMEOUT',
            message: 'La operación de pago ha excedido el tiempo de espera',
            details: {
                maxWaitTime: '2 minutos',
                suggestion: 'Por favor, intente realizar el pago nuevamente'
            }
        });
      }
  }, 120000);

  // Listener para pago completado
  eventEmitter.once('paymentCompleted', (data) => {
      clearTimeout(timeout); // Limpiar el timeout
      eventEmitter.removeAllListeners('tubeStatus'); // Limpiar el otro listener
      
      res.status(200).json({
        success: true,
        code: 'PAYMENT_COMPLETED',
        EstadoPago: 'completado',
        TotalPagado: data.totalPaid,
        timestamp: new Date().toISOString()
    });
  });

  // Listener para estado del tubo
  eventEmitter.once('tubeStatus', () => {
      clearTimeout(timeout); // Limpiar el timeout
      
      if (!res.headersSent) {
          
          res.status(200).json({
            success: true,
            code: 'PAYMENT_IN_PROGRESS',
            EstadoPago: 'en proceso',
            timestamp: new Date().toISOString()
        });
      }
  });
};

export const createTicket = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const repository = new TicketRepository();
    const printerService = new UsbPrinterService();

    const printerReady = await printerService.initialize();
    if (!printerReady) {
      console.warn('Impresora no disponible, continuando sin impresión');
    }
    // Crear datos base del ticket
    const ticketData = {
      ...req.body,
      qr_code: `TKT-${Date.now()}`, // Temporal, se actualizará en el pre-save
      expiry_date: new Date(Date.now() + (4 * 60 * 60 * 1000)) // 4 horas desde ahora
    };

    const ticketResource = new TicketResource(await repository.create(ticketData));
    const ticket = ticketResource.item();
    
    try {
      await printerService.printTicket(ticket);
    } catch (printError) {
      console.error('Error de impresión:', printError);
      // Podemos decidir si queremos continuar aunque falle la impresión
    }

    // prueba local para ver el ticked y su pdf de respuesta
    const docDefinition = ticketDocument(ticket);

    createPdfBinary(docDefinition, function (binary) {
      res.contentType('application/pdf');
      res.setHeader('Content-Disposition', 'attachment; filename=ticket.pdf');
      res.send(Buffer.from(binary, 'base64'));
    });
  } catch (error) {
    next(error);
  }
};