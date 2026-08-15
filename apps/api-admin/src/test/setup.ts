import { MongoMemoryServer } from 'mongodb-memory-server'
import { afterAll, afterEach, beforeAll } from 'vitest'
import { connectToDatabase, disconnectFromDatabase, mongoose } from '@repo/models/db'

/** LOCKED FILE — Team 01 (Core Platform). See `api-student` for the rationale. */

let mongo: MongoMemoryServer

beforeAll(async () => {
  mongo = await MongoMemoryServer.create()
  process.env.MONGODB_URI = mongo.getUri()
  process.env.JWT_ACCESS_SECRET = 'test-access-secret'
  process.env.JWT_REFRESH_SECRET = 'test-refresh-secret'
  await connectToDatabase()
})

afterEach(async () => {
  const collections = await mongoose.connection.db?.collections()
  await Promise.all((collections ?? []).map((c) => c.deleteMany({})))
})

afterAll(async () => {
  await disconnectFromDatabase()
  await mongo?.stop()
})
