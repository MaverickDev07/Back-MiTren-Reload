import Line, { LineAttributes } from '../database/models/Line'
import BaseRepository from './BaseRepository'

export default class LineRepository extends BaseRepository<LineAttributes> {
  protected allowedSortByFields = ['line_name', 'color', 'status', 'createdAt', 'updatedAt']
  protected allowedFilterByFields = ['line_name', 'color']

  constructor() {
    super(Line)
  }

  async getAllByActive(): Promise<Array<LineAttributes>> {
    return this.model
      .find({ status: 'ACTIVE' }, { line_name: 1, color: 1 })
      .sort({ createdAt: 1 })
      .exec()
  }
}
