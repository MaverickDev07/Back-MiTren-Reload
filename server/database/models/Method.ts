import { Schema, model, Document } from 'mongoose'

export type MethodEntity = {
  id?: string | any
  method_name: string
  status?: string
  createdAt?: Date
  updatedAt?: Date
}

export interface MethodAttributes extends MethodEntity, Document {}

const MethodSchema = new Schema<MethodAttributes>(
  {
    method_name: {
      type: String,
      uppercase: true,
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
  },
  {
    timestamps: true,
    versionKey: false,
  },
)

const Method = model<MethodAttributes>('Method', MethodSchema)

export default Method
