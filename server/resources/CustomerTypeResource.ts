import { CustomerTypeAttributes, CustomerTypeEntity } from '../database/models/CustomerType'
import BaseResource from './BaseResource'

class CustomerTypeResource extends BaseResource<CustomerTypeAttributes, CustomerTypeEntity>() {
  item() {
    const customerTypeResource: CustomerTypeEntity = {
      id: this.instance.id,
      customer_type: this.instance.customer_type,
      description: this.instance.description,
      status: this.instance.status,
      createdAt: this.instance.createdAt,
      updatedAt: this.instance.updatedAt,
    }

    return customerTypeResource
  }
}

export default CustomerTypeResource
