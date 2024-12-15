import { Schema, model, Document } from 'mongoose'

type CustomerType = {
  type_id: Schema.Types.ObjectId
  customer_type: string
}

export type CustomerEntity = {
  id?: string | any
  email: string
  name: string
  lastname: string
  doc_type: string
  doc_number: string
  status?: string
  type: CustomerType
  createdAt?: Date
  updatedAt?: Date
}

export interface CustomerAttributes extends CustomerEntity, Document {}

const CustomerSchema = new Schema<CustomerAttributes>(
  {
    email: {
      type: String,
      uppercase: true,
      trim: true,
      unique: true,
      required: true,
    },
    name: {
      type: String,
      uppercase: true,
      trim: true,
      required: true,
    },
    lastname: {
      type: String,
      uppercase: true,
      trim: true,
      required: true,
    },
    doc_type: {
      type: String,
      enum: ['CI', 'PP', 'NIT'],
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
    status: {
      type: String,
      enum: ['ACTIVE', 'INACTIVE'],
      uppercase: true,
      trim: true,
      default: 'ACTIVE',
    },
    type: {
      type: {
        type_id: {
          type: Schema.Types.ObjectId,
          ref: 'CustomerType',
          required: true,
        },
        customer_type: {
          type: String,
          uppercase: true,
          trim: true,
          required: true,
        },
      },
      required: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
)

const Customer = model<CustomerAttributes>('Customer', CustomerSchema)

export default Customer
