import { Types } from 'mongoose'
import Kiosk, { KioskAttributes } from '../database/models/Kiosk'
import BaseRepository from './BaseRepository'
import ApiError from '../errors/ApiError'

export default class KioskRepository extends BaseRepository<KioskAttributes> {
  protected allowedSortByFields = ['kiosk_type', 'status', 'createdAt', 'updatedAt']
  protected allowedFilterByFields = ['kiosk_code']

  constructor() {
    super(Kiosk)
  }

  async getStationByKioskId(id: string | Types.ObjectId): Promise<KioskAttributes | null> {
    const kiosk = await this.model.findById(id).populate('station_id').exec()
    if (!kiosk) {
      throw new ApiError({
        name: 'MODEL_NOT_FOUND_ERROR',
        message: 'No se encontró el kiosco',
        status: 400,
        code: 'ERR_MNF',
      })
    }
    return kiosk
  }
}
