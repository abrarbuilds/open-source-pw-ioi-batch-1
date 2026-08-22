import { Schema, type Types } from 'mongoose'
import type { AttendanceStatus } from '@repo/validation/enums'
import { defineModel } from './define-model'

/** Owner: Team 06 — Attendance. Largest collection in the system. */
export interface AttendanceDoc {
  _id: Types.ObjectId
  sessionId: Types.ObjectId
  subjectId: Types.ObjectId
  studentId: Types.ObjectId
  status: AttendanceStatus
  markedBy: Types.ObjectId
  markedAt: Date
  note: string | null
  createdAt: Date
  updatedAt: Date
}

const attendanceSchema = new Schema<AttendanceDoc>(
  {
    sessionId: { type: Schema.Types.ObjectId, ref: 'ClassSession', required: true, index: true },
    // Denormalised from the session so attendance-percentage aggregations do not
    // need a $lookup on the hottest query in the app.
    subjectId: { type: Schema.Types.ObjectId, ref: 'Subject', required: true },
    studentId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    status: {
      type: String,
      required: true,
      enum: ['PRESENT', 'ABSENT', 'LATE', 'EXCUSED'],
      default: 'ABSENT',
    },
    markedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    markedAt: { type: Date, required: true, default: () => new Date() },
    note: { type: String, default: null },
  },
  { timestamps: true },
)

// A student can only be marked once per session.
attendanceSchema.index({ sessionId: 1, studentId: 1 }, { unique: true })
attendanceSchema.index({ studentId: 1, subjectId: 1 })

export const Attendance = defineModel<AttendanceDoc>('Attendance', attendanceSchema)
