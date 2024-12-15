import { Schema, model, Document } from 'mongoose'

export type CustomerTypeEntity = {
  id?: string | any
  customer_type: string
  description: string
  status?: string
  createdAt?: Date
  updatedAt?: Date
}

export interface CustomerTypeAttributes extends CustomerTypeEntity, Document {}

const CustomerTypeSchema = new Schema<CustomerTypeAttributes>(
  {
    customer_type: {
      type: String,
      uppercase: true,
      trim: true,
      unique: true,
      required: true,
    },
    description: {
      type: String,
      uppercase: true,
      trim: true,
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

const CustomerType = model<CustomerTypeAttributes>('CustomerType', CustomerTypeSchema)

export default CustomerType
