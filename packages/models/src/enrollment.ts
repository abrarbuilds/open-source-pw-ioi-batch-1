import { Schema, type Types } from 'mongoose'
import { defineModel } from './define-model'

/** Owner: Team 10 — Admin Core & Batch Management. */
export interface EnrollmentDoc {
  _id: Types.ObjectId
  studentId: Types.ObjectId
  subjectId: Types.ObjectId
  batchId: Types.ObjectId
  createdAt: Date
  updatedAt: Date
}

const enrollmentSchema = new Schema<EnrollmentDoc>(
  {
    studentId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    subjectId: { type: Schema.Types.ObjectId, ref: 'Subject', required: true },
    batchId: { type: Schema.Types.ObjectId, ref: 'Batch', required: true, index: true },
  },
  { timestamps: true },
)

// A student can only be enrolled in a subject once.
enrollmentSchema.index({ studentId: 1, subjectId: 1 }, { unique: true })

export const Enrollment = defineModel<EnrollmentDoc>('Enrollment', enrollmentSchema)
