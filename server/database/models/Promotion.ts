import { Schema, model, Document, Types } from 'mongoose'

export type PromotionEntity = {
  id?: string | any
  title: string
  description: string
  price: number
  /*start_date: Date
  end_date: Date*/
  line_id: Array<Types.ObjectId>
  status?: string
  createdAt?: Date
  updatedAt?: Date
}

export interface PromotionAttributes extends PromotionEntity, Document {}

const PromotionSchema = new Schema<PromotionAttributes>(
  {
    title: {
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
    price: {
      type: Number,
      required: true,
    },
    line_id: {
      type: [Types.ObjectId],
      ref: 'Line',
      required: true,
    },
    status: {
      type: String,
      enum: ['ACTIVE', 'INACTIVE'],
      uppercase: true,
      trim: true,
      default: 'INACTIVE',
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
)

const Promotion = model<PromotionAttributes>('Promotion', PromotionSchema)

export default Promotion
