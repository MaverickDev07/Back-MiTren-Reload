import { Schema, model, Document, Types } from 'mongoose'

type SalesByLine = {
  line_id: Types.ObjectId
  line_name: string
  ticket_count: number
  total_amount: number
  customer_types: {
    type: string
    count: number
    amount: number
  }[]
}

export type TicketAnalyticsEntity = {
  id?: string | any
  date: Date
  year: number
  month: number
  day: number
  hour: number
  total_tickets: number
  total_amount: number
  sales_by_line: SalesByLine[]
  payment_method: {
    method_id: Types.ObjectId
    method_name: string
    count: number
    amount: number
  }
  status?: string
  createdAt?: Date
  updatedAt?: Date
}

export interface TicketAnalyticsAttributes extends TicketAnalyticsEntity, Document {}

const TicketAnalyticsSchema = new Schema<TicketAnalyticsAttributes>(
  {
    date: {
      type: Date,
      required: true,
    },
    year: {
      type: Number,
      required: true,
    },
    month: {
      type: Number,
      required: true,
    },
    day: {
      type: Number,
      required: true,
    },
    hour: {
      type: Number,
      required: true,
    },
    total_tickets: {
      type: Number,
      default: 0,
    },
    total_amount: {
      type: Number,
      default: 0,
    },
    sales_by_line: [{
      line_id: {
        type: Schema.Types.ObjectId,
        ref: 'Line',
        required: true,
      },
      line_name: {
        type: String,
        required: true,
      },
      ticket_count: {
        type: Number,
        default: 0,
      },
      total_amount: {
        type: Number,
        default: 0,
      },
      customer_types: [{
        type: {
          type: String,
          required: true,
        },
        count: {
          type: Number,
          default: 0,
        },
        amount: {
          type: Number,
          default: 0,
        }
      }]
    }],
    payment_method: {
      method_id: {
        type: Schema.Types.ObjectId,
        ref: 'Method',
        required: true,
      },
      method_name: {
        type: String,
        required: true,
      },
      count: {
        type: Number,
        default: 0,
      },
      amount: {
        type: Number,
        default: 0,
      }
    },
    status: {
      type: String,
      enum: ['ACTIVE', 'INACTIVE'],
      default: 'ACTIVE',
    }
  },
  {
    timestamps: true,
    versionKey: false,
  }
)

// Índices para mejorar las consultas
TicketAnalyticsSchema.index({ date: 1 })
TicketAnalyticsSchema.index({ year: 1, month: 1 })
TicketAnalyticsSchema.index({ 'sales_by_line.line_id': 1 })

const TicketAnalytics = model<TicketAnalyticsAttributes>('TicketAnalytics', TicketAnalyticsSchema)

export default TicketAnalytics



// tiket con un tiempo limite de tiempo uso de cuatro horas
// {
//     id-ticket: tiene ser el id del ticked
//     paypago: "Completado / Efectivo" es esta parte si el pago esta completado
//     "payment_method": {
//         "method_name": "PQR",
//         "method_id": "90629"
//     },
//     "prices": [
//         {
//             "qty": 2,
//             "customer_type": "GENERAL",
//             "base_price": 5.5
//         },
//         {
//             "qty": 1,
//             "customer_type": "PREFERENCIAL",
//             "base_price": 4
//         }
//     ],
//     "route": {
//         "start_point": {
//             "start_station": "ESTACIÓN MUNICIPAL AGRONOMÍA",
//             "start_line": "LÍNEA ROJA"
//         },
//         "end_point": {
//             "end_station": "ESTACIÓN MUNICIPAL COLCAPIRHUA",
//             "end_line": "LÍNEA VERDE"
//         },
//         "transfer_point": {
//             "is_transfer": true,
//             "transfer_station": "ESTACION CENTRAL SAN ANTONIO"
//         }
//     }
// }