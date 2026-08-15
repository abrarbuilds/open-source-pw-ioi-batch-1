import { Schema, type Types } from 'mongoose'
import { defineModel } from './define-model'

/**
 * Owner: Team 09 — Student Profile & Notes.
 *
 * A student's own notes. Private by construction: every query must filter by
 * `studentId` taken from the verified token, never from the request.
 */
export interface NoteDoc {
  _id: Types.ObjectId
  studentId: Types.ObjectId
  subjectId: Types.ObjectId | null
  sessionId: Types.ObjectId | null
  title: string
  body: string
  pinned: boolean
  createdAt: Date
  updatedAt: Date
}

const noteSchema = new Schema<NoteDoc>(
  {
    studentId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    subjectId: { type: Schema.Types.ObjectId, ref: 'Subject', default: null },
    sessionId: { type: Schema.Types.ObjectId, ref: 'ClassSession', default: null },
    title: { type: String, required: true, trim: true, maxlength: 200 },
    body: { type: String, default: '' },
    pinned: { type: Boolean, default: false },
  },
  { timestamps: true },
)

noteSchema.index({ studentId: 1, pinned: -1, updatedAt: -1 })
noteSchema.index({ studentId: 1, subjectId: 1 })

export const Note = defineModel<NoteDoc>('Note', noteSchema)
