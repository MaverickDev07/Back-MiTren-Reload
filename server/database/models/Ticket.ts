import { Schema, model, Document } from 'mongoose';

type StationCheck = {
  station_name: string;
  line_name: string;
  checked_at: Date;
  checked_by: Schema.Types.ObjectId;
};

type PaymentMethod = {
  method_name: string;
  method_id: any; // Cambiado a ObjectId
};

type StartStation = {
  start_station: string;
  start_line: string;
};

type EndStation = {
  end_station: string;
  end_line: string;
};

type TransferStation = {
  is_transfer: boolean;
  transfer_station?: string; // Puede ser opcional
};

type Price = {
  qty: number;
  customer_type: string;
  base_price: number;
};

type Route = {
  start_point: StartStation;
  end_point: EndStation;
  transfer_point?: TransferStation; // Puede ser opcional
};

export type TicketEntity = {
  id?: string | any;
  kiosk_code: string;
  qr_code?: string; 
  expiry_date?: Date; 
  promotion_title?: string;
  total_price: number;
  payment_method: PaymentMethod;
  prices: Array<Price>;
  route: Route;
  status?: string;
  station_checks?: Array<StationCheck>;
  journey_status?: string;
  last_check?: Date;
  current_station?: string;
  current_line?: string;
  createdAt?: Date;
  updatedAt?: Date;
};

export interface TicketAttributes extends TicketEntity, Document {
  qr_code?: string;
  expiry_date?: Date; 
}
interface PaymentMethodAttributes extends PaymentMethod, Document {}
interface PriceAttributes extends Price, Document {}
interface RouteAttributes extends Route, Document {}

const StationCheckSchema = new Schema({
  station_name: {
    type: String,
    uppercase: true,
    trim: true,
    required: true,
  },
  line_name: {
    type: String,
    uppercase: true,
    trim: true,
    required: true,
  },
  checked_at: {
    type: Date,
    required: true,
  },
  checked_by: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  }
});

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
);

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
      required: false,
    },
  },
  {
    timestamps: false,
    versionKey: false,
  },
);

const PaymentMethodSchema = new Schema<PaymentMethodAttributes>(
  {
    method_name: {
      type: String,
      uppercase: true,
      trim: true,
      required: true,
    },
    method_id: {
      type: Schema.Types.ObjectId, // Cambiado a ObjectId
      required: true,
      ref: 'methods', // Referencia a la colección de métodos de pago
    },
  },
  {
    timestamps: false,
    versionKey: false,
  },
);

const TicketSchema = new Schema<TicketAttributes>(
  {
    qr_code: {
      type: String,
      unique: true,
      required: true,
    },
    expiry_date: {
      type: Date,
      required: true,
    },
    used_date: {
      type: Date,
    },
    scanned_by: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
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
    // Nuevos campos para tracking
    station_checks: {
      type: [StationCheckSchema],
      default: [],
    },
    journey_status: {
      type: String,
      enum: ['NOT_STARTED', 'IN_PROGRESS', 'TRANSFER_NEEDED', 'COMPLETED'],
      default: 'NOT_STARTED',
    },
    last_check: {
      type: Date,
    },
    current_station: {
      type: String,
      uppercase: true,
      trim: true,
    },
    current_line: {
      type: String,
      uppercase: true,
      trim: true,
    },
    status: {
      type: String,
      enum: [
        'PAID', 
        'ACTIVE', 
        'EXPIRED', 
        'CANCELLED', 
        'USED', 
        'REFUNDED',
        'IN_TRANSIT',
        'COMPLETED'
      ],
      uppercase: true,
      trim: true,
      default: 'PAID',
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

TicketSchema.index({ qr_code: 1 });
TicketSchema.index({ status: 1 });
TicketSchema.index({ journey_status: 1 });
TicketSchema.index({ expiry_date: 1 });

TicketSchema.methods.isValidNextStation = function(station: string, line: string): boolean {
  const route = this.route;
  
  // Si no hay verificaciones previas, debe ser la estación de inicio
  if (this.station_checks.length === 0) {
    return station === route.start_point.start_station && 
           line === route.start_point.start_line;
  }

  // Si es una estación de transbordo
  if (route.transfer_point?.is_transfer && 
      station === route.transfer_point.transfer_station) {
    return true;
  }

  // Si es la estación final
  if (station === route.end_point.end_station && 
      line === route.end_point.end_line) {
    return this.journey_status === 'IN_PROGRESS' || 
           this.journey_status === 'TRANSFER_NEEDED';
  }

  return false;
};

// Método para registrar una verificación
TicketSchema.methods.addStationCheck = async function(
  station: string, 
  line: string, 
  userId: Schema.Types.ObjectId
) {
  const now = new Date();
  
  this.station_checks.push({
    station_name: station,
    line_name: line,
    checked_at: now,
    checked_by: userId
  });

  this.last_check = now;
  this.current_station = station;
  this.current_line = line;

  // Actualizar estado del viaje
  if (this.station_checks.length === 1) {
    this.journey_status = 'IN_PROGRESS';
    this.status = 'IN_TRANSIT';
  } else if (station === this.route.end_point.end_station) {
    this.journey_status = 'COMPLETED';
    this.status = 'COMPLETED';
  } else if (
    this.route.transfer_point?.is_transfer && 
    station === this.route.transfer_point.transfer_station
  ) {
    this.journey_status = 'TRANSFER_NEEDED';
  }

  await this.save();
  return this;
};

// Método para verificar si el ticket está en una ventana de tiempo válida para transbordo
TicketSchema.methods.isValidTransferWindow = function(): boolean {
  if (!this.last_check) return false;
  
  const TRANSFER_WINDOW_MINUTES = 30; // Ventana de 30 minutos para transbordo
  const now = new Date();
  const timeSinceLastCheck = (now.getTime() - this.last_check.getTime()) / (1000 * 60);
  
  return timeSinceLastCheck <= TRANSFER_WINDOW_MINUTES;
};

// Middleware para generar QR y fecha de expiración
TicketSchema.pre('save', function(next) {
  if (this.isNew) {
    // Generar QR único
    this.qr_code = `TKT-${this._id}-${Date.now()}`;
    // Establecer fecha de expiración (4 horas)
    const now = new Date();
    this.expiry_date = new Date(now.getTime() + 4 * 60 * 60 * 1000);
    
    // Si el pago está verificado, cambiar estado a ACTIVE
    if (this.status === 'PAID') {
      this.status = 'ACTIVE';
    }
  }
  next();
});
const Ticket = model<TicketAttributes>('Ticket', TicketSchema);

export default Ticket;