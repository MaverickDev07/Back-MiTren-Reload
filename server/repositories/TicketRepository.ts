import Ticket, { TicketAttributes } from '../database/models/Ticket'
import BaseRepository from './BaseRepository'

export default class TicketRepository extends BaseRepository<TicketAttributes> {
  protected allowedSortByFields = [
    'kiosk_code',
    'promotion_title',
    'status',
    'createdAt',
    'updatedAt',
  ]
  protected allowedFilterByFields = ['kiosk_code']

  constructor() {
    super(Ticket)
  }
}
