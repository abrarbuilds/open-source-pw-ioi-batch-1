import { Schema, type Types } from 'mongoose'
import type { NotificationType } from '@repo/validation/enums'
import { defineModel } from './define-model'

/** Owner: Team 08 — Announcements & Notifications. */
export interface NotificationDoc {
  _id: Types.ObjectId
  userId: Types.ObjectId
  type: NotificationType
  title: string
  body: string
  /** Where clicking the notification should take the student. */
  href: string | null
  readAt: Date | null
  createdAt: Date
  updatedAt: Date
}

const notificationSchema = new Schema<NotificationDoc>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    type: {
      type: String,
      required: true,
      enum: [
        'MATERIAL_ADDED',
        'ASSIGNMENT_PUBLISHED',
        'ASSIGNMENT_DUE_SOON',
        'SUBMISSION_GRADED',
        'ATTENDANCE_LOW',
        'ANNOUNCEMENT',
      ],
    },
    title: { type: String, required: true },
    body: { type: String, default: '' },
    href: { type: String, default: null },
    readAt: { type: Date, default: null },
  },
  { timestamps: true },
)

notificationSchema.index({ userId: 1, readAt: 1, createdAt: -1 })

export const Notification = defineModel<NotificationDoc>('Notification', notificationSchema)
