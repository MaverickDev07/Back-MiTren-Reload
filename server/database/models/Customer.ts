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
  customerType: CustomerType
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
      required: [true, 'El campo email es obligatorio'],
      match: [/.+@.+\..+/, 'El email debe tener un formato válido'],
    },
    name: {
      type: String,
      uppercase: true,
      trim: true,
      required: [true, 'El nombre es obligatorio'],
    },
    lastname: {
      type: String,
      uppercase: true,
      trim: true,
      required: [true, 'El apellido es obligatorio'],
    },
    doc_type: {
      type: String,
      enum: ['CI', 'PP', 'NIT'],
      uppercase: true,
      trim: true,
      required: [true, 'El tipo de documento es obligatorio'],
    },
    doc_number: {
      type: String,
      trim: true,
      unique: true,
      required: [true, 'El número de documento es obligatorio'],
      minlength: [6, 'El número de documento debe tener al menos 6 caracteres'],
    },
    status: {
      type: String,
      enum: ['ACTIVE', 'INACTIVE'],
      uppercase: true,
      trim: true,
      default: 'ACTIVE',
    },
    customerType: {
      type: {
        type_id: {
          type: Schema.Types.ObjectId,
          ref: 'CustomerType',
          required: [true, 'El ID del tipo de cliente es obligatorio'],
        },
        customer_type: {
          type: String,
          uppercase: true,
          trim: true,
          required: [true, 'El tipo de cliente es obligatorio'],
          enum: ['PROMOCION', 'GENERAL', 'ESTUDIANTES', "PREFERENCIAL"],
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

