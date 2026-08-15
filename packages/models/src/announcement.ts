import { Schema, type Types } from 'mongoose'
import { defineModel } from './define-model'

/** Owner: Team 08 — Announcements & Notifications. */
export interface AnnouncementDoc {
  _id: Types.ObjectId
  batchId: Types.ObjectId
  subjectId: Types.ObjectId | null
  title: string
  body: string
  pinned: boolean
  authorId: Types.ObjectId
  createdAt: Date
  updatedAt: Date
}

const announcementSchema = new Schema<AnnouncementDoc>(
  {
    batchId: { type: Schema.Types.ObjectId, ref: 'Batch', required: true, index: true },
    subjectId: { type: Schema.Types.ObjectId, ref: 'Subject', default: null },
    title: { type: String, required: true, trim: true },
    body: { type: String, required: true },
    pinned: { type: Boolean, default: false },
    authorId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true },
)

announcementSchema.index({ batchId: 1, pinned: -1, createdAt: -1 })

export const Announcement = defineModel<AnnouncementDoc>('Announcement', announcementSchema)
