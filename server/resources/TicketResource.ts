import { TicketAttributes, TicketEntity } from '../database/models/Ticket'
import BaseResource from './BaseResource'

class TicketResource extends BaseResource<TicketAttributes, TicketEntity>() {
  item() {
    const ticketResource: TicketEntity = {
      id: this.instance.id,
      kiosk_code: this.instance.kiosk_code,
      promotion_title: this.instance.promotion_title,
      total_price: this.instance.total_price,
      payment_method: this.instance.payment_method,
      prices: this.instance.prices,
      route: this.instance.route,
      status: this.instance.status,
      createdAt: this.instance.createdAt,
      updatedAt: this.instance.updatedAt,
    }

    return ticketResource
  }
}

export default TicketResource
