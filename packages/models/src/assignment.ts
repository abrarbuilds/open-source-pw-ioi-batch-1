import { Schema, type Types } from 'mongoose'
import { defineModel } from './define-model'

/** Owner: Team 05 — Assignments & Submissions. */
export interface AssignmentDoc {
  _id: Types.ObjectId
  subjectId: Types.ObjectId
  title: string
  description: string
  dueAt: Date
  maxMarks: number
  attachments: { publicId: string; url: string; name: string }[]
  createdBy: Types.ObjectId
  isPublished: boolean
  createdAt: Date
  updatedAt: Date
}

const assignmentSchema = new Schema<AssignmentDoc>(
  {
    subjectId: { type: Schema.Types.ObjectId, ref: 'Subject', required: true, index: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    dueAt: { type: Date, required: true, index: true },
    maxMarks: { type: Number, required: true, min: 0 },
    attachments: {
      type: [
        new Schema(
          {
            publicId: { type: String, required: true },
            url: { type: String, required: true },
            name: { type: String, required: true },
          },
          { _id: false },
        ),
      ],
      default: [],
    },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    isPublished: { type: Boolean, default: false },
  },
  { timestamps: true },
)

assignmentSchema.index({ subjectId: 1, dueAt: 1 })

export const Assignment = defineModel<AssignmentDoc>('Assignment', assignmentSchema)
