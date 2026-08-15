import { Schema, type Types } from 'mongoose'
import { defineModel } from './define-model'

/** Owner: Team 10 — Admin Core & Batch Management. */
export interface BatchDoc {
  _id: Types.ObjectId
  name: string
  year: number
  program: string
  startDate: Date
  endDate: Date | null
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

const batchSchema = new Schema<BatchDoc>(
  {
    name: { type: String, required: true, trim: true },
    year: { type: Number, required: true },
    program: { type: String, required: true, trim: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, default: null },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
)

batchSchema.index({ name: 1, year: 1 }, { unique: true })

export const Batch = defineModel<BatchDoc>('Batch', batchSchema)
