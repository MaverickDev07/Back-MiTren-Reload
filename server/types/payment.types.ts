export interface PaymentRequest {
    monto: number;
  }
  
  export interface PosPaymentRequest {
    monto: number;
    cod_moneda: string;
  }
  
  export interface PosResponse {
    estado: string;
    numeroKiosko: string;
    numeroSecuencia: string;
    montoTransacción: number;
    codigoMoneda: string;
    respuestaTransacción: string;
    referencia: string;
    fecha: string;
    hora: string;
    autorizacion: string;
    pan: string;
    mensaje: string;
  }
  
  export interface Payment {
    monto: number;
    moneda: string;
    estado: string;
    referencia?: string;
    autorizacion?: string;
    pan?: string;
    mensaje?: string;
    comercio?: string;
    terminal?: string;
    createdAt: Date;
    updatedAt: Date;
  }