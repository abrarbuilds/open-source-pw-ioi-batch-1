import { Schema, type Types } from 'mongoose'
import { defineModel } from './define-model'

/**
 * Owner: Team 13 — AI Assistant.
 *
 * Stored so we can debug bad answers and review abuse. `tokensUsed` is what the
 * per-user rate limit and the monthly budget alert are computed from — keep it
 * accurate.
 */
export interface ConversationDoc {
  _id: Types.ObjectId
  userId: Types.ObjectId
  title: string
  messages: {
    role: 'user' | 'assistant'
    content: string
    toolsUsed: string[]
    createdAt: Date
  }[]
  tokensUsed: { input: number; output: number }
  createdAt: Date
  updatedAt: Date
}

const conversationSchema = new Schema<ConversationDoc>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    title: { type: String, default: 'New chat' },
    messages: {
      type: [
        new Schema(
          {
            role: { type: String, required: true, enum: ['user', 'assistant'] },
            content: { type: String, required: true },
            toolsUsed: { type: [String], default: [] },
            createdAt: { type: Date, default: () => new Date() },
          },
          { _id: false },
        ),
      ],
      default: [],
    },
    tokensUsed: {
      type: new Schema(
        {
          input: { type: Number, default: 0 },
          output: { type: Number, default: 0 },
        },
        { _id: false },
      ),
      default: () => ({ input: 0, output: 0 }),
    },
  },
  { timestamps: true },
)

conversationSchema.index({ userId: 1, updatedAt: -1 })

export const Conversation = defineModel<ConversationDoc>('Conversation', conversationSchema)
