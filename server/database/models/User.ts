import { Schema, model, Document } from 'mongoose'

export type UserEntity = {
  id?: string | any
  fullname: string
  doc_number: string
  role_name: string
  password: string
  status?: string
  createdAt?: Date
  updatedAt?: Date
}

export interface UserAttributes extends UserEntity, Document {}

const UserSchema = new Schema<UserAttributes>(
  {
    fullname: {
      type: String,
      uppercase: true,
      trim: true,
      required: true,
    },
    doc_number: {
      type: String,
      trim: true,
      unique: true,
      required: true,
    },
    role_name: {
      type: String,
      enum: ['ROOT', 'ADMIN', 'BOLETERIA','BOLETERO'],
      uppercase: true,
      trim: true,
      required: true,
    },
    password: {
      type: String,
      trim: true,
      required: true
    },
    status: {
      type: String,
      enum: ['ACTIVE', 'INACTIVE'],
      uppercase: true,
      trim: true,
      default: 'ACTIVE',
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
)

const User = model<UserAttributes>('User', UserSchema)
export default User
