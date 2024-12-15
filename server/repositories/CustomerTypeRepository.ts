import CustomerType, { CustomerTypeAttributes } from '../database/models/CustomerType'
import BaseRepository from './BaseRepository'

export default class CustomerTypeRepository extends BaseRepository<CustomerTypeAttributes> {
  protected allowedSortByFields = ['status', 'createdAt', 'updatedAt']
  protected allowedFilterByFields = ['customer_type', 'description']

  constructor() {
    super(CustomerType)
  }
}
