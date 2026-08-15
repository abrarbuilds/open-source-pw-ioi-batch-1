import { Schema, type Types } from 'mongoose'
import type { Role } from '@repo/validation/enums'
import { defineModel } from './define-model'

/** Owner: Team 03 — Auth & Identity. */
export interface UserDoc {
  _id: Types.ObjectId
  name: string
  email: string
  passwordHash: string
  role: Role
  batchId: Types.ObjectId | null
  avatarUrl: string | null
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

const userSchema = new Schema<UserDoc>(
  {
    name: { type: String, required: true, trim: true, maxlength: 80 },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true, select: false },
    role: { type: String, required: true, enum: ['STUDENT', 'FACULTY', 'ADMIN'], default: 'STUDENT' },
    batchId: { type: Schema.Types.ObjectId, ref: 'Batch', default: null, index: true },
    avatarUrl: { type: String, default: null },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
)

userSchema.index({ batchId: 1, role: 1 })

export const User = defineModel<UserDoc>('User', userSchema)
