import { Schema, type Types } from 'mongoose'
import { defineModel } from './define-model'

/**
 * Owner: Team 03 — Auth & Identity.
 *
 * We store a hash of each issued refresh token so a stolen token can be revoked
 * and so rotation can detect reuse. `expiresAt` has a TTL index, so Mongo cleans
 * up expired rows for us.
 */
export interface RefreshTokenDoc {
  _id: Types.ObjectId
  userId: Types.ObjectId
  tokenHash: string
  expiresAt: Date
  revokedAt: Date | null
  createdAt: Date
  updatedAt: Date
}

const refreshTokenSchema = new Schema<RefreshTokenDoc>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    tokenHash: { type: String, required: true, unique: true },
    expiresAt: { type: Date, required: true },
    revokedAt: { type: Date, default: null },
  },
  { timestamps: true },
)

refreshTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 })

export const RefreshToken = defineModel<RefreshTokenDoc>('RefreshToken', refreshTokenSchema)
