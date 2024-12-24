import { PaymentModel } from '../../database/models/paymentPos.model'

import { PosService } from './pos.service';
import { PaymentRequest, Payment, PosPaymentRequest } from '../../types/payment.types';

export class PaymentService {
  private posService: PosService;
  private readonly DEFAULT_CURRENCY = '068'; // BOB por defecto
  private readonly DEFAULT_TERMINAL = '10210008'; // Terminal para BOB

  constructor() {
    this.posService = new PosService();
  }

  async createPayment(data: PaymentRequest): Promise<Payment> {
    try {
      // Crear objeto para el POS con la moneda por defecto
      const posData: PosPaymentRequest = {
        monto: data.monto,
        cod_moneda: this.DEFAULT_CURRENCY
      };

      const posResponse = await this.posService.processPayment(posData);

      const payment = await PaymentModel.create({
        monto: data.monto,
        moneda: this.DEFAULT_CURRENCY,
        estado: posResponse.estado,
        referencia: posResponse.referencia,
        autorizacion: posResponse.autorizacion,
        pan: posResponse.pan,
        mensaje: posResponse.mensaje,
        comercio: '9999999',
        terminal: this.DEFAULT_TERMINAL
      });

      return payment;
    } catch (error) {
      throw new Error(`Error al procesar pago: ${error.message}`);
    }
  }

  async getPaymentByReference(reference: string): Promise<Payment | null> {
    return PaymentModel.findOne({ referencia: reference });
  }
}