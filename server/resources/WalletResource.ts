import { WalletAttributes, WalletEntity } from '../database/models/Wallet'
import BaseResource from './BaseResource'

class WalletResource extends BaseResource<WalletAttributes, WalletEntity>() {
  item() {
    const walletResource: WalletEntity = {
      id: this.instance.id,
      code: this.instance.code,
      price: this.instance.price,
      currency: this.instance.currency,
      amount_paid: this.instance.amount_paid,
      cash_back: this.instance.cash_back,
      payment_methods: this.instance.payment_methods,
      created_on: this.instance.created_on,
      status: this.instance.status,
      summary: this.instance.summary,
    }

    return walletResource
  }
}

export default WalletResource
