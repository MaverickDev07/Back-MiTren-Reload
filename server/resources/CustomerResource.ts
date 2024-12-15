import { CustomerAttributes, CustomerEntity } from '../database/models/Customer'
import BaseResource from './BaseResource'

class CustomerResource extends BaseResource<CustomerAttributes, CustomerEntity>() {
  item() {
    const customerResource: CustomerEntity = {
      id: this.instance.id,
      email: this.instance.email,
      name: this.instance.name,
      lastname: this.instance.lastname,
      doc_type: this.instance.doc_type,
      doc_number: this.instance.doc_number,
      status: this.instance.status,
      type: this.instance.type,
      createdAt: this.instance.createdAt,
      updatedAt: this.instance.updatedAt,
    }

    return customerResource
  }
}

export default CustomerResource
