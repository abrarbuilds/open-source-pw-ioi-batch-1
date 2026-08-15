import { Schema, type Types } from 'mongoose'
import type { MaterialType } from '@repo/validation/enums'
import { defineModel } from './define-model'

/** Owner: Team 04 — Class Materials. */
export interface MaterialDoc {
  _id: Types.ObjectId
  subjectId: Types.ObjectId
  sessionId: Types.ObjectId | null
  title: string
  description: string | null
  type: MaterialType
  /** Populated for uploaded files; null for LINK materials. */
  cloudinary: { publicId: string; url: string; bytes: number; format: string } | null
  /** Populated for LINK materials. */
  externalUrl: string | null
  uploadedBy: Types.ObjectId
  createdAt: Date
  updatedAt: Date
}

const materialSchema = new Schema<MaterialDoc>(
  {
    subjectId: { type: Schema.Types.ObjectId, ref: 'Subject', required: true, index: true },
    sessionId: { type: Schema.Types.ObjectId, ref: 'ClassSession', default: null },
    title: { type: String, required: true, trim: true },
    description: { type: String, default: null },
    type: {
      type: String,
      required: true,
      enum: ['PPT', 'PDF', 'DOC', 'VIDEO', 'LINK', 'OTHER'],
      default: 'OTHER',
    },
    cloudinary: {
      type: new Schema(
        {
          publicId: { type: String, required: true },
          url: { type: String, required: true },
          bytes: { type: Number, required: true },
          format: { type: String, required: true },
        },
        { _id: false },
      ),
      default: null,
    },
    externalUrl: { type: String, default: null },
    uploadedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true },
)

materialSchema.index({ subjectId: 1, createdAt: -1 })
materialSchema.index({ title: 'text', description: 'text' })

export const Material = defineModel<MaterialDoc>('Material', materialSchema)
