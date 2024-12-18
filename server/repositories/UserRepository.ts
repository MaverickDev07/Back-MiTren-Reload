import bcrypt from 'bcryptjs'

import User, { UserAttributes } from '../database/models/User'
import BaseRepository from './BaseRepository'
import { Types, UpdateQuery } from 'mongoose'

export default class UserRepository extends BaseRepository<UserAttributes> {
  protected allowedSortByFields = ['role_name', 'status', 'createdAt', 'updatedAt']
  protected allowedFilterByFields = ['fullname', 'doc_number']

  constructor() {
    super(User)
  }

  async create(body: Record<string, any>): Promise<UserAttributes> {
    await this.validateReferences(body)
    body.password = await this.encryptPassword(body.password)
    return this.model.create(body)
  }

  async encryptPassword(password: string) {
    const salt = await bcrypt.genSalt(10)
    return await bcrypt.hash(password, salt)
  }

  async comparePassword(password: string, receivedPassword: string) {
    return await bcrypt.compare(password, receivedPassword)
  }

  async updatePasswordByUserId(userId: string | Types.ObjectId, data: UpdateQuery<UserAttributes>) {
    (data as any).password = await this.encryptPassword((data as any).password)
  
    return this.model.findByIdAndUpdate(userId, data, { new: true }).exec()
  }
  
  getAuthByDocNumber(doc_number: string): Promise<UserAttributes | null> {
    return this.model.findOne({ doc_number }).exec()
  }
}
