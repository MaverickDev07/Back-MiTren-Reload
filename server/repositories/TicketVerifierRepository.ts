import Ticket from '../database/models/Ticket'
import ApiError from '../errors/ApiError'
import BaseRepository from './BaseRepository'

export default class TicketVerifierRepository extends BaseRepository {
  async verifyTicket(qr_code: string, verificationData: {
    current_station: string,
    current_line: string,
    user_id: string
  }) {
    const ticket = await Ticket.findOne({ qr_code })
    
    if (!ticket) {
      return {
        status: 'WRONG',
        message: 'Ticket inválido',
        display_color: 'red',
        ticket: null
      }
    }

    // Verificar expiración
    if (new Date() > ticket.expiry_date!) {
      ticket.status = 'EXPIRED'
      await ticket.save()
      return {
        status: 'EXPIRED',
        message: 'Ticket caducado',
        display_color: 'yellow',
        ticket
      }
    }

    // Verificar validez de la estación
    if (!ticket.isValidNextStation(verificationData.current_station, verificationData.current_line)) {
      return {
        status: 'WRONG',
        message: 'Estación no válida para esta ruta',
        display_color: 'red',
        ticket
      }
    }

    // Registrar verificación
    await ticket.addStationCheck(
      verificationData.current_station,
      verificationData.current_line,
      verificationData.user_id
    )

    return {
      status: 'OK',
      message: this.getSuccessMessage(ticket),
      display_color: 'green',
      ticket
    }
  }

  private getSuccessMessage(ticket: any): string {
    switch (ticket.journey_status) {
      case 'IN_PROGRESS':
        return 'Inicio de viaje válido'
      case 'TRANSFER_NEEDED':
        return 'Transbordo válido'
      case 'COMPLETED':
        return 'Destino alcanzado'
      default:
        return 'Ticket válido'
    }
  }

  async getVerificationHistory(userId: string) {
    return Ticket.find({
      'station_checks.checked_by': userId
    })
    .sort({ 'station_checks.checked_at': -1 })
    .limit(50)
  }

  async getDailyStats(userId: string) {
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const stats = await Ticket.aggregate([
      {
        $match: {
          'station_checks.checked_by': userId,
          'station_checks.checked_at': { $gte: today }
        }
      },
      {
        $group: {
          _id: '$journey_status',
          count: { $sum: 1 }
        }
      }
    ])

    return {
      today: stats.reduce((acc, curr) => {
        acc[curr._id.toLowerCase()] = curr.count
        return acc
      }, {
        in_progress: 0,
        transfer_needed: 0,
        completed: 0
      })
    }
  }
}