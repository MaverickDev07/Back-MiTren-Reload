/* eslint-disable max-lines */
import { Schema, model, Document } from 'mongoose'

type PaymentMethod = {
  method_name: string
  method_id: string
}

type StartStation = {
  start_station: string
  start_line: string
}

type EndStation = {
  end_station: string
  end_line: string
}

type TransferStation = {
  is_transfer: boolean
  transfer_station: string
}

type Price = {
  qty: number
  customer_type: string
  base_price: number
}

type Route = {
  start_point: StartStation
  end_point: EndStation
  transfer_point: TransferStation
}

export type TicketEntity = {
  id?: string | any
  kiosk_code: string
  promotion_title?: string
  total_price: number
  payment_method: PaymentMethod
  prices: Array<Price>
  route: Route
  status?: string
  createdAt?: Date
  updatedAt?: Date
}

export interface TicketAttributes extends TicketEntity, Document {}
interface PaymentMethodAttributes extends PaymentMethod, Document {}
interface PriceAttributes extends Price, Document {}
interface RouteAttributes extends Route, Document {}

const PriceSchema = new Schema<PriceAttributes>(
  {
    qty: {
      type: Number,
      min: 1,
      required: true,
    },
    customer_type: {
      type: String,
      uppercase: true,
      trim: true,
      required: true,
    },
    base_price: {
      type: Number,
      min: 0.1,
      required: true,
    },
  },
  {
    timestamps: false,
    versionKey: false,
  },
)
const RouteSchema = new Schema<RouteAttributes>(
  {
    start_point: {
      type: {
        start_line: {
          type: String,
          uppercase: true,
          trim: true,
          required: true,
        },
        start_station: {
          type: String,
          uppercase: true,
          trim: true,
          required: true,
        },
      },
      required: true,
    },
    end_point: {
      type: {
        end_line: {
          type: String,
          uppercase: true,
          trim: true,
          required: true,
        },
        end_station: {
          type: String,
          uppercase: true,
          trim: true,
          required: true,
        },
      },
      required: true,
    },
    transfer_point: {
      type: {
        is_transfer: {
          type: Boolean,
          default: false,
        },
        transfer_station: {
          type: String,
          uppercase: true,
          trim: true,
        },
      },
      required: true,
    },
  },
  {
    timestamps: false,
    versionKey: false,
  },
)
const PaymentMethodSchema = new Schema<PaymentMethodAttributes>(
  {
    method_name: {
      type: String,
      uppercase: true,
      trim: true,
      required: true,
    },
    method_id: {
      type: String,
      trim: true,
      required: true,
    },
  },
  {
    timestamps: false,
    versionKey: false,
  },
)

const TicketSchema = new Schema<TicketAttributes>(
  {
    kiosk_code: {
      type: String,
      uppercase: true,
      trim: true,
      required: true,
    },
    promotion_title: {
      type: String,
      uppercase: true,
      trim: true,
      default: 'SIN PROMOCIÓN',
    },
    total_price: {
      type: Number,
      min: 0.1,
      required: true,
    },
    payment_method: {
      type: PaymentMethodSchema,
      required: true,
    },
    prices: {
      type: [PriceSchema],
      required: true,
    },
    route: {
      type: RouteSchema,
      required: true,
    },
    status: {
      type: String,
      enum: ['PAID', 'ACTIVE', 'EXPIRED', 'CANCELLED', 'USED', 'REFUNDED'],
      uppercase: true,
      trim: true,
      default: 'PAID',
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
)

const Ticket = model<TicketAttributes>('Ticket', TicketSchema)

export default Ticket
