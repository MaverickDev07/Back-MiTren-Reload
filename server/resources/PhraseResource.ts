import { PhraseAttributes, PhraseEntity } from '../database/models/Phrase'
import BaseResource from './BaseResource'

class PhraseResource extends BaseResource<PhraseAttributes, PhraseEntity>() {
  item() {
    const phraseResource: PhraseEntity = {
      id: this.instance.id,
      content: this.instance.content,
      status: this.instance.status,
      createdAt: this.instance.createdAt,
      updatedAt: this.instance.updatedAt,
    }

    return phraseResource
  }
}

export default PhraseResource
