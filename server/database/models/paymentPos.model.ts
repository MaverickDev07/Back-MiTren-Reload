import mongoose, { Schema, Document } from 'mongoose';
import { Payment } from '../../types/payment.types';

export interface PaymentDocument extends Payment, Document {}

const PaymentSchema = new Schema({
  monto: { 
    type: Number, 
    required: true 
  },
  moneda: { 
    type: String, 
    required: true,
    enum: ['068']
  },
  estado: { 
    type: String, 
    required: true 
  },
  referencia: String,
  autorizacion: String,
  pan: String,
  mensaje: String,
  comercio: String,
  terminal: String,
}, {
  timestamps: true,
  versionKey: false
});

export const PaymentModel = mongoose.model<PaymentDocument>('Payment', PaymentSchema);