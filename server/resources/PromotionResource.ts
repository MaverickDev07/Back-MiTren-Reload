import { PromotionAttributes, PromotionEntity } from '../database/models/Promotion'
import BaseResource from './BaseResource'

class PromotionResource extends BaseResource<PromotionAttributes, PromotionEntity>() {
  item() {
    const promotionResource: PromotionEntity = {
      id: this.instance.id,
      title: this.instance.title,
      description: this.instance.description,
      price: this.instance.price,
      line_id: this.instance.line_id,
      status: this.instance.status,
      createdAt: this.instance.createdAt,
      updatedAt: this.instance.updatedAt,
    }

    return promotionResource
  }
}

export default PromotionResource
