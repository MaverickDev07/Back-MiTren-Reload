import { Schema, model, Document } from 'mongoose'

export type PhraseEntity = {
  id?: string | any
  content: string
  status?: string
  createdAt?: Date
  updatedAt?: Date
}

export interface PhraseAttributes extends PhraseEntity, Document {}

const PhraseSchema = new Schema<PhraseAttributes>(
  {
    content: {
      type: String,
      uppercase: true,
      trim: true,
      required: true,
    },
    status: {
      type: String,
      enum: ['ACTIVE', 'INACTIVE'],
      uppercase: true,
      trim: true,
      default: 'INACTIVE',
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
)

const Phrase = model<PhraseAttributes>('Phrase', PhraseSchema)

export default Phrase
