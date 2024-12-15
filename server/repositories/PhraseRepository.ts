import Phrase, { PhraseAttributes } from '../database/models/Phrase'
import BaseRepository from './BaseRepository'

export default class PhraseRepository extends BaseRepository<PhraseAttributes> {
  protected allowedSortByFields = ['createdAt', 'updatedAt']
  protected allowedFilterByFields = ['content']

  constructor() {
    super(Phrase)
  }

  async getAllByActive(): Promise<Array<PhraseAttributes>> {
    return this.model
      .find({ status: 'ACTIVE' }, { line_name: 1, color: 1 })
      .sort({ createdAt: 1 })
      .exec()
  }
}
