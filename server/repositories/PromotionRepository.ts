import Promotion, { PromotionAttributes } from '../database/models/Promotion'
import BaseRepository from './BaseRepository'

export default class PromotionRepository extends BaseRepository<PromotionAttributes> {
  protected allowedSortByFields = ['status', 'createdAt', 'updatedAt']
  protected allowedFilterByFields = ['title', 'price']

  constructor() {
    super(Promotion)
  }
}
