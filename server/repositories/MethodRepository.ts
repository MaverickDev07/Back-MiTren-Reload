import Method, { MethodAttributes } from '../database/models/Method'
import BaseRepository from './BaseRepository'

export default class MethodRepository extends BaseRepository<MethodAttributes> {
  protected allowedSortByFields = ['method_name', 'status', 'createdAt', 'updatedAt']
  protected allowedFilterByFields = ['method_name']

  constructor() {
    super(Method)
  }

  async getAllByActive(): Promise<Array<MethodAttributes>> {
    return this.model.find({ status: 'ACTIVE' }, { method_name: 1 }).sort({ createdAt: 1 }).exec()
  }
}
