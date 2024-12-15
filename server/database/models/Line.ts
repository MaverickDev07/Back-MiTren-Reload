import { Schema, model, Document } from 'mongoose'

export type LineEntity = {
  id?: string | any
  line_name: string
  color: string
  status?: string
  createdAt?: Date
  updatedAt?: Date
}

export interface LineAttributes extends LineEntity, Document {}

const LineSchema = new Schema<LineAttributes>(
  {
    line_name: {
      type: String,
      uppercase: true,
      trim: true,
      unique: true,
      required: true,
    },
    color: {
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

const Line = model<LineAttributes>('Line', LineSchema)

export default Line
