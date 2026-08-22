import { Schema, type Types } from 'mongoose'
import { defineModel } from './define-model'

/** Owner: Team 07 — Timetable & Sessions. One instance of a lecture. */
export interface ClassSessionDoc {
  _id: Types.ObjectId
  subjectId: Types.ObjectId
  title: string
  scheduledAt: Date
  durationMins: number
  room: string | null
  facultyId: Types.ObjectId | null
  isCancelled: boolean
  createdAt: Date
  updatedAt: Date
}

const classSessionSchema = new Schema<ClassSessionDoc>(
  {
    subjectId: { type: Schema.Types.ObjectId, ref: 'Subject', required: true, index: true },
    title: { type: String, required: true, trim: true },
    scheduledAt: { type: Date, required: true, index: true },
    durationMins: { type: Number, default: 60, min: 1 },
    room: { type: String, default: null },
    facultyId: { type: Schema.Types.ObjectId, ref: 'User', default: null },
    isCancelled: { type: Boolean, default: false },
  },
  { timestamps: true },
)

classSessionSchema.index({ subjectId: 1, scheduledAt: 1 })

export const ClassSession = defineModel<ClassSessionDoc>('ClassSession', classSessionSchema)
