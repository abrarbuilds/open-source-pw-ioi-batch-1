import mongoose from 'mongoose'

/**
 * LOCKED FILE — Team 01 (Core Platform).
 *
 * Serverless connection caching. Every Vercel Function invocation runs in a
 * process that may be reused ("warm"), so opening a new Mongo connection per
 * request would exhaust the Atlas M0 connection cap within minutes. We stash a
 * single in-flight promise on `globalThis` and reuse it.
 *
 * Call `connectToDatabase()` at the top of every request handler. It is cheap
 * once warm — it resolves the cached connection.
 */

type MongooseCache = {
  conn: typeof mongoose | null
  promise: Promise<typeof mongoose> | null
}

declare global {
  // eslint-disable-next-line no-var
  var __mongooseCache: MongooseCache | undefined
}

const cache: MongooseCache = globalThis.__mongooseCache ?? { conn: null, promise: null }
globalThis.__mongooseCache = cache

export async function connectToDatabase(uri: string | undefined = process.env.MONGODB_URI) {
  if (!uri) {
    throw new Error('MONGODB_URI is not set. Copy .env.example to .env and fill it in.')
  }

  if (cache.conn) return cache.conn

  if (!cache.promise) {
    cache.promise = mongoose.connect(uri, {
      // Fail fast in a serverless function rather than hanging the request.
      serverSelectionTimeoutMS: 10_000,
      maxPoolSize: 10,
    })
  }

  cache.conn = await cache.promise
  return cache.conn
}

/** Used by tests and scripts that need a clean shutdown. */
export async function disconnectFromDatabase() {
  if (cache.conn) {
    await cache.conn.disconnect()
    cache.conn = null
    cache.promise = null
  }
}

export { mongoose }
