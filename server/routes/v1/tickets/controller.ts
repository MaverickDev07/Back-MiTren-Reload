import { NextFunction, Request, Response } from 'express'
import TicketResource from '../../../resources/TicketResource'
import TicketRepository from '../../../repositories/TicketRepository'

export const listTickets = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const repository = new TicketRepository()
    const tickets = TicketResource.collection(
      await repository.getAll({
        sortBy: req.query.sort_by as string,
        filterBy: req.query.filter_by as string,
      }),
    )
    res.status(200).json({ tickets })
  } catch (error: any) {
    next(error)
  }
}

export const getTicket = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const repository = new TicketRepository()
    const ticketResource = new TicketResource(await repository.getById(req.params.id))
    res.status(200).json({ ticket: ticketResource.item() })
  } catch (error: any) {
    next(error)
  }
}

export const updateTicket = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const repository = new TicketRepository()
    const ticketResource = new TicketResource(await repository.update(req.params.id, req.body))
    res.status(200).json({ ticket: ticketResource.item() })
  } catch (error) {
    next(error)
  }
}

export const deleteTicket = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const repository = new TicketRepository()
    await repository.delete(req.params.id)

    res.status(204).send()
  } catch (error) {
    next(error)
  }
}
