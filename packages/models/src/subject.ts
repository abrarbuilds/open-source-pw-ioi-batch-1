import { Schema, type Types } from 'mongoose'
import { defineModel } from './define-model'

/** Owner: Team 10 — Admin Core & Batch Management. */
export interface SubjectDoc {
  _id: Types.ObjectId
  name: string
  code: string
  batchId: Types.ObjectId
  facultyId: Types.ObjectId | null
  credits: number
  createdAt: Date
  updatedAt: Date
}

const subjectSchema = new Schema<SubjectDoc>(
  {
    name: { type: String, required: true, trim: true },
    code: { type: String, required: true, trim: true, uppercase: true },
    batchId: { type: Schema.Types.ObjectId, ref: 'Batch', required: true, index: true },
    facultyId: { type: Schema.Types.ObjectId, ref: 'User', default: null },
    credits: { type: Number, default: 3, min: 0 },
  },
  { timestamps: true },
)

subjectSchema.index({ batchId: 1, code: 1 }, { unique: true })

export const Subject = defineModel<SubjectDoc>('Subject', subjectSchema)
