import dotenv from 'dotenv';
import axios from 'axios';
import { PosPaymentRequest, PosResponse } from '../../types/payment.types';

dotenv.config();
const HOST = process.env.POS_IP;
const PORT = process.env.POS_PORT;

export class PosService {
  private readonly baseUrl: string;

  constructor() {
    this.baseUrl = `http://${HOST}:${PORT}`;
  }

  async processPayment(data: PosPaymentRequest): Promise<PosResponse> {
    try {
      // Convertir monto decimal a entero (4050 para 40.50)
      const montoFormat = Math.round(data.monto * 100);
      
      const url = `${this.baseUrl}/sale?monto=${montoFormat}&cod_moneda=${data.cod_moneda}`;
      console.log(url)
      const { data: response } = await axios.get<PosResponse>(url, {
        timeout: 60000 // 60 segundos
      });

      return response;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(`Error comunicación POS: ${error.message}`);
      }
      throw error;
    }
  }
}