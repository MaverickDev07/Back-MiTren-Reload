import { UserAttributes, UserEntity } from '../database/models/User'
import BaseResource from './BaseResource'

class UserResource extends BaseResource<UserAttributes, UserEntity>() {
  item() {
    const userResource: UserEntity = {
      id: this.instance.id,
      fullname: this.instance.fullname,
      doc_number: this.instance.doc_number,
      role_name: this.instance.role_name,
      status: this.instance.status,
      createdAt: this.instance.createdAt,
      updatedAt: this.instance.updatedAt,
    }

    return userResource
  }
}

export default UserResource
