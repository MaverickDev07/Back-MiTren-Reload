import NfcCard, { NfcCardAttributes } from '../database/models/NfcCard'
import BaseRepository from './BaseRepository'

export default class NfcCardRepository extends BaseRepository<NfcCardAttributes> {
  protected allowedSortByFields = ['status', 'createdAt', 'updatedAt']
  protected allowedFilterByFields = ['card_code', 'user', 'customer']

  constructor() {
    super(NfcCard)
  }
}
