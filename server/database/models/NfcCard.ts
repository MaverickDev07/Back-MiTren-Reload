import { Schema, model, Document } from 'mongoose'

type User = {
  user_id: Schema.Types.ObjectId
  fullname: string
}

type Customer = {
  fullname: string
  doc_number: string
  cell_phone: number
}

export type NfcCardEntity = {
  id?: string | any
  card_code: string
  balance: number
  status?: string
  user: User
  customer: Customer
  createdAt?: Date
  updatedAt?: Date
}

export interface NfcCardAttributes extends NfcCardEntity, Document {}

const NfcCardSchema = new Schema<NfcCardAttributes>(
  {
    card_code: {
      type: String,
      uppercase: true,
      trim: true,
      unique: true,
      required: true,
    },
    balance: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ['ACTIVE', 'INACTIVE', 'BLOCKED'],
      uppercase: true,
      trim: true,
      default: 'ACTIVE',
    },
    user: {
      user_id: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
      },
      fullname: {
        type: String,
        uppercase: true,
        trim: true,
        required: true,
      },
    },
    customer: {
      fullname: {
        type: String,
        uppercase: true,
        trim: true,
        required: true,
      },
      doc_number: {
        type: String,
        trim: true,
        unique: true,
        required: true,
      },
      cell_phone: {
        type: Number,
        required: true,
      },
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
)

const NfcCard = model<NfcCardAttributes>('NfcCard', NfcCardSchema)

export default NfcCard
