import { StationPairPrices } from './types'
import ApiError from '../../errors/ApiError'

export default class StationPairPricesResource {
  private data: StationPairPrices

  constructor(data: StationPairPrices | null) {
    if (!data) {
      throw new ApiError({
        name: 'NOT_FOUND_ERROR',
        message: 'Entity StationPair not found',
        status: 404,
        code: 'ERR_NF',
      })
    }
    this.data = data
  }

  public getPrices(): StationPairPrices {
    return this.data
  }
}
