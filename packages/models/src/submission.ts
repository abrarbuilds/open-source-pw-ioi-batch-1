import { Schema, type Types } from 'mongoose'
import type { SubmissionStatus } from '@repo/validation/enums'
import { defineModel } from './define-model'

/** Owner: Team 05 — Assignments & Submissions. */
export interface SubmissionDoc {
  _id: Types.ObjectId
  assignmentId: Types.ObjectId
  studentId: Types.ObjectId
  files: { publicId: string; url: string; name: string; bytes: number }[]
  note: string | null
  submittedAt: Date
  status: SubmissionStatus
  marks: number | null
  feedback: string | null
  gradedBy: Types.ObjectId | null
  gradedAt: Date | null
  createdAt: Date
  updatedAt: Date
}

const submissionSchema = new Schema<SubmissionDoc>(
  {
    assignmentId: { type: Schema.Types.ObjectId, ref: 'Assignment', required: true, index: true },
    studentId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    files: {
      type: [
        new Schema(
          {
            publicId: { type: String, required: true },
            url: { type: String, required: true },
            name: { type: String, required: true },
            bytes: { type: Number, required: true },
          },
          { _id: false },
        ),
      ],
      default: [],
    },
    note: { type: String, default: null },
    submittedAt: { type: Date, required: true, default: () => new Date() },
    status: {
      type: String,
      required: true,
      enum: ['SUBMITTED', 'LATE', 'GRADED'],
      default: 'SUBMITTED',
    },
    marks: { type: Number, default: null },
    feedback: { type: String, default: null },
    gradedBy: { type: Schema.Types.ObjectId, ref: 'User', default: null },
    gradedAt: { type: Date, default: null },
  },
  { timestamps: true },
)

// One submission per student per assignment — resubmission updates this row.
submissionSchema.index({ assignmentId: 1, studentId: 1 }, { unique: true })

export const Submission = defineModel<SubmissionDoc>('Submission', submissionSchema)
