import { mongoose } from './db'
import type { Model, Schema } from 'mongoose'

/**
 * LOCKED FILE — Team 01 (Core Platform).
 *
 * `mongoose.model()` throws `OverwriteModelError` if called twice with the same
 * name, which happens constantly with hot reload and warm serverless processes.
 * Always register models through this helper.
 */
export function defineModel<T>(name: string, schema: Schema<T>): Model<T> {
  return (mongoose.models[name] as Model<T>) ?? mongoose.model<T>(name, schema)
}
