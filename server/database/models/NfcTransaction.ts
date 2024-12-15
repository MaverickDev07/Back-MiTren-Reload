import { Schema, model, Document } from 'mongoose'

type Method = {
  method_id: Schema.Types.ObjectId
  method_name: string
}

export type NfcTransactionEntity = {
  id?: string | any
  customer_type: string
  amount: number
  date_time: Date
  card_id: Schema.Types.ObjectId
  method: Method
  status?: string
  createdAt?: Date
  updatedAt?: Date
}

export interface NfcTransactionAttributes extends NfcTransactionEntity, Document {}

const NfcTransactionSchema = new Schema<NfcTransactionAttributes>(
  {
    customer_type: {
      type: String,
      uppercase: true,
      trim: true,
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    date_time: {
      type: Date,
      default: Date.now,
    },
    card_id: {
      type: Schema.Types.ObjectId,
      ref: 'Card',
      required: true,
    },

    method: {
      type: {
        method_id: {
          type: Schema.Types.ObjectId,
          ref: 'Method',
          required: true,
        },
        method_name: {
          type: String,
          uppercase: true,
          trim: true,
          required: true,
        },
      },
      required: true,
    },
    status: {
      type: String,
      enum: ['ACTIVE', 'INACTIVE'],
      uppercase: true,
      trim: true,
      default: 'ACTIVE',
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
)

const NfcTransaction = model<NfcTransactionAttributes>('NfcTransaction', NfcTransactionSchema)

export default NfcTransaction
