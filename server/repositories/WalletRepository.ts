import Wallet, { WalletAttributes } from '../database/models/Wallet'
import BaseRepository from './BaseRepository'

export default class WalletRepository extends BaseRepository<WalletAttributes> {
  protected allowedSortByFields = ['status', 'createdAt', 'updatedAt']
  protected allowedFilterByFields = ['summary']

  constructor() {
    super(Wallet)
  }
}
