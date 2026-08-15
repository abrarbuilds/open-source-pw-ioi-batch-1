import { Schema, type Types } from 'mongoose'
import { defineModel } from './define-model'

/** Owner: Team 11 — Admin People, Roles & Audit. Written by `api-admin` only. */
export interface AuditLogDoc {
  _id: Types.ObjectId
  actorId: Types.ObjectId
  action: string
  entity: string
  entityId: Types.ObjectId | null
  meta: Record<string, unknown>
  createdAt: Date
  updatedAt: Date
}

const auditLogSchema = new Schema<AuditLogDoc>(
  {
    actorId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    action: { type: String, required: true },
    entity: { type: String, required: true },
    entityId: { type: Schema.Types.ObjectId, default: null },
    meta: { type: Schema.Types.Mixed, default: {} },
  },
  { timestamps: true },
)

auditLogSchema.index({ entity: 1, entityId: 1, createdAt: -1 })

export const AuditLog = defineModel<AuditLogDoc>('AuditLog', auditLogSchema)
