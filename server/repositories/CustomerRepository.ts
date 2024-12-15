import Customer, { CustomerAttributes } from '../database/models/Customer'
import BaseRepository from './BaseRepository'

export default class CustomerRepository extends BaseRepository<CustomerAttributes> {
  protected allowedSortByFields = ['lastname', 'status']
  protected allowedFilterByFields = [
    'email',
    'name',
    'lastname',
    'doc_type',
    'doc_number',
    'status',
  ]

  constructor() {
    super(Customer)
  }
}
