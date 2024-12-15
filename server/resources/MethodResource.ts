import { MethodAttributes, MethodEntity } from '../database/models/Method'
import BaseResource from './BaseResource'

class MethodResource extends BaseResource<MethodAttributes, MethodEntity>() {
  item() {
    const methodResource: MethodEntity = {
      id: this.instance.id,
      method_name: this.instance.method_name,
      status: this.instance.status,
      createdAt: this.instance.createdAt,
      updatedAt: this.instance.updatedAt,
    }

    return methodResource
  }
}

export default MethodResource
