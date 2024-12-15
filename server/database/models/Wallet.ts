import { Schema, model, Document } from 'mongoose'

export type WalletEntity = {
  id?: string | any
  code: Schema.Types.ObjectId
  price: number
  currency: string
  amount_paid: number
  cash_back: number
  payment_methods: string
  created_on: Date
  summary: string
  status?: string
}

export interface WalletAttributes extends WalletEntity, Document {}

const WalletSchema = new Schema<WalletAttributes>(
  {
    code: {
      type: Schema.Types.ObjectId,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    currency: {
      type: String,
      //emun: ['BOB'],
      default: 'BOB',
    },
    amount_paid: {
      type: Number,
      required: true,
    },
    cash_back: {
      type: Number,
      required: true,
    },
    payment_methods: {
      type: String,
      required: true,
    },
    created_on: {
      type: Date,
      default: new Date(),
    },
    summary: {
      type: String,
      default: '',
    },
    status: {
      type: String,
      // enum: ['PENDING', 'APPROVED', 'REJECTED'],
      default: 'PENDIENTE',
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
)

const Wallet = model<WalletAttributes>('Wallet', WalletSchema)

export default Wallet
