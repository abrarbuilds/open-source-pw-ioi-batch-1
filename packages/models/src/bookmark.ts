import { Schema, type Types } from 'mongoose'
import type { BookmarkTarget } from '@repo/validation/enums'
import { defineModel } from './define-model'

/**
 * Owner: Team 09 — Student Profile & Notes.
 *
 * "Save this for later" across materials, assignments and announcements.
 * Deliberately polymorphic-lite: a type plus an id, rather than one collection
 * per bookmarkable thing.
 */
export interface BookmarkDoc {
  _id: Types.ObjectId
  studentId: Types.ObjectId
  entityType: BookmarkTarget
  entityId: Types.ObjectId
  createdAt: Date
  updatedAt: Date
}

const bookmarkSchema = new Schema<BookmarkDoc>(
  {
    studentId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    entityType: {
      type: String,
      required: true,
      enum: ['MATERIAL', 'ASSIGNMENT', 'ANNOUNCEMENT'],
    },
    entityId: { type: Schema.Types.ObjectId, required: true },
  },
  { timestamps: true },
)

// Bookmarking the same thing twice is a no-op, not a duplicate row.
bookmarkSchema.index({ studentId: 1, entityType: 1, entityId: 1 }, { unique: true })

export const Bookmark = defineModel<BookmarkDoc>('Bookmark', bookmarkSchema)
