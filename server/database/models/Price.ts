import { Schema, model, Document } from 'mongoose'

type Station = {
  station_id: Schema.Types.ObjectId
  station_name: string
}

export type PriceEntity = {
  id?: string | any
  base_price: number
  customer_type: string
  customer_type_id: Schema.Types.ObjectId
  start_station: Station
  end_station: Station
  status?: string
  createdAt?: Date
  updatedAt?: Date
}

export interface PriceAttributes extends PriceEntity, Document {}

const PriceSchema = new Schema<PriceAttributes>(
  {
    base_price: {
      type: Number,
      required: true,
    },
    customer_type: {
      type: String,
      uppercase: true,
      trim: true,
      required: true,
    },
    customer_type_id: {
      type: Schema.Types.ObjectId,
      ref: 'CustomerType',
      required: true,
    },
    start_station: {
      type: {
        station_id: {
          type: Schema.Types.ObjectId,
          ref: 'Station',
          required: true,
        },
        station_name: {
          type: String,
          uppercase: true,
          trim: true,
          required: true,
        },
      },
      required: true,
    },
    end_station: {
      type: {
        station_id: {
          type: Schema.Types.ObjectId,
          ref: 'Station',
          required: true,
        },
        station_name: {
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

const Price = model<PriceAttributes>('Price', PriceSchema)

export default Price
