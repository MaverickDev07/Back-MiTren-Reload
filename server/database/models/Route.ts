import { Schema, model, Document } from 'mongoose'

type Station = {
  station_id: Schema.Types.ObjectId
  station_name: string
}

export type RouteEntity = {
  id?: string | any
  line_id: Schema.Types.ObjectId
  stations: Array<Station>
  status?: string
  createdAt?: Date
  updatedAt?: Date
}

export interface RouteAttributes extends RouteEntity, Document {}

const RouteSchema = new Schema<RouteAttributes>(
  {
    line_id: {
      type: Schema.Types.ObjectId,
      ref: 'Line',
      required: true,
      unique: true,
    },
    stations: {
      type: [
        {
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
      ],
      required: true,
      validate: {
        validator: (value: Station[]) => {
          return value.length > 1
        },
        message: 'El array "stations" debe contener al menos dos ítems.',
      },
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

const Route = model<RouteAttributes>('Route', RouteSchema)

export default Route
