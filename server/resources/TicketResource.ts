import { TicketAttributes, TicketEntity } from '../database/models/Ticket'
import BaseResource from './BaseResource'

class TicketResource extends BaseResource<TicketAttributes, TicketEntity>() {
  item() {
    const ticketResource: TicketEntity = {
      id: this.instance.id,
      kiosk_code: this.instance.kiosk_code,
      qr_code: this.instance.qr_code,
      expiry_date: this.instance.expiry_date,
      promotion_title: this.instance.promotion_title,
      total_price: this.instance.total_price,
      payment_method: this.instance.payment_method,
      prices: this.instance.prices,
      route: this.instance.route,
      status: this.instance.status,
      // Nuevos campos para verificación
      station_checks: this.instance.station_checks?.map(check => ({
        station_name: check.station_name,
        line_name: check.line_name,
        checked_at: check.checked_at,
        checked_by: check.checked_by
      })),
      journey_status: this.instance.journey_status,
      last_check: this.instance.last_check,
      current_station: this.instance.current_station,
      current_line: this.instance.current_line,
      createdAt: this.instance.createdAt,
      updatedAt: this.instance.updatedAt,
    }

    return ticketResource
  }

  // Método adicional para respuesta del verificador
  verificationResponse() {
    return {
      ticket_info: {
        route: {
          origin: this.instance.route.start_point.start_station,
          destination: this.instance.route.end_point.end_station,
          origin_line: this.instance.route.start_point.start_line,
          destination_line: this.instance.route.end_point.end_line,
          transfer: this.instance.route.transfer_point?.is_transfer ? {
            station: this.instance.route.transfer_point.transfer_station
          } : null
        },
        journey: {
          status: this.instance.journey_status,
          current_station: this.instance.current_station,
          current_line: this.instance.current_line,
          last_check: this.instance.last_check,
        },
        ticket: {
          status: this.instance.status,
          expiry_date: this.instance.expiry_date,
          prices: this.instance.prices.map(price => ({
            type: price.customer_type,
            qty: price.qty,
            base_price: price.base_price
          }))
        }
      }
    }
  }

  // Método para historial de verificaciones
  verificationHistory() {
    return {
      id: this.instance.id,
      qr_code: this.instance.qr_code,
      route: {
        start: `${this.instance.route.start_point.start_line} - ${this.instance.route.start_point.start_station}`,
        end: `${this.instance.route.end_point.end_line} - ${this.instance.route.end_point.end_station}`
      },
      status: this.instance.status,
      journey_status: this.instance.journey_status,
      checks: this.instance.station_checks?.map(check => ({
        station: check.station_name,
        line: check.line_name,
        time: check.checked_at
      })),
      expiry_date: this.instance.expiry_date
    }
  }
}

export default TicketResource