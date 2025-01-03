import { NextFunction, Request, Response } from 'express'
import ApiError from '../../../errors/ApiError'
import TicketVerifierRepository from '../../../repositories/TicketVerifierRepository'
import TicketResource from '../../../resources/TicketResource'

export const verifyTicket = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { qr_code, current_station, current_line } = req.body
    const user_id = req.user?.id

    if (!user_id) {
      throw new ApiError({
        name: 'UNAUTHORIZED_ERROR',
        message: 'Usuario no autorizado',
        status: 401,
        code: 'ERR_UNAUTH',
      })
    }

    const repository = new TicketVerifierRepository()
    const verificationResult = await repository.verifyTicket(qr_code, {
      current_station,
      current_line,
      user_id
    })

    if (!verificationResult.ticket) {
      return res.status(200).json({
        status: 'WRONG',
        message: 'Ticket no encontrado o inválido',
        display_color: 'red'
      })
    }

    const ticketResource = new TicketResource(verificationResult.ticket)
    const response = {
      status: verificationResult.status,
      message: verificationResult.message,
      display_color: verificationResult.display_color,
      ...ticketResource.verificationResponse() // Usando el nuevo método específico para verificación
    }

    res.status(200).json(response)
  } catch (error) {
    next(error)
  }
}

export const getVerificationHistory = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const repository = new TicketVerifierRepository()
    const history = await repository.getVerificationHistory(req.user?.id)
    
    const formattedHistory = history.map(ticket => {
      const resource = new TicketResource(ticket)
      return resource.verificationHistory() // Usando el nuevo método para historial
    })

    res.status(200).json({
      success: true,
      verifications: formattedHistory
    })
  } catch (error) {
    next(error)
  }
}

export const getVerificationStats = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const repository = new TicketVerifierRepository()
    const stats = await repository.getDailyStats(req.user?.id)
    
    // Formato más detallado de estadísticas
    const formattedStats = {
      today: {
        total_scans: stats.total_scans || 0,
        by_status: {
          active: stats.today.active || 0,
          expired: stats.today.expired || 0,
          completed: stats.today.completed || 0,
          invalid: stats.today.invalid || 0
        },
        by_line: stats.by_line || {}
      },
      last_scan: stats.last_scan
    }

    res.status(200).json({
      success: true,
      stats: formattedStats
    })
  } catch (error) {
    next(error)
  }
}

// Nuevo endpoint para validar si un usuario puede verificar tickets
export const validateVerifierAccess = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user_id = req.user?.id

    if (!user_id) {
      throw new ApiError({
        name: 'UNAUTHORIZED_ERROR',
        message: 'Usuario no autorizado',
        status: 401,
        code: 'ERR_UNAUTH',
      })
    }

    const repository = new TicketVerifierRepository()
    const canVerify = await repository.validateVerifierAccess(user_id)

    if (!canVerify) {
      throw new ApiError({
        name: 'FORBIDDEN_ERROR',
        message: 'Usuario no tiene permisos de verificador',
        status: 403,
        code: 'ERR_FORB',
      })
    }

    res.status(200).json({
      success: true,
      message: 'Usuario autorizado para verificar tickets'
    })
  } catch (error) {
    next(error)
  }
}