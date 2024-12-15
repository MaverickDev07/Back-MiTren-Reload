import { Schema, model, Document, Types } from 'mongoose'

type Location = {
  latitude: number
  longitude: number
}

export type StationEntity = {
  id?: string | any
  station_name: string
  line_id: Array<Types.ObjectId>
  is_transfer_stop?: boolean
  location: Location
  status?: string
  createdAt?: Date
  updatedAt?: Date
}

export interface StationAttributes extends StationEntity, Document {}

const StationSchema = new Schema<StationAttributes>(
  {
    station_name: {
      type: String,
      uppercase: true,
      trim: true,
      unique: true,
      required: true,
    },
    line_id: {
      type: [Types.ObjectId],
      ref: 'Line',
      required: true,
    },
    is_transfer_stop: {
      type: Boolean,
      default: false,
    },
    location: {
      type: {
        latitude: {
          type: Number,
          required: true,
        },
        longitude: {
          type: Number,
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

const Station = model<StationAttributes>('Station', StationSchema)

export default Station
