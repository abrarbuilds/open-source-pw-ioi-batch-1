import { mkdirSync } from 'node:fs'
import { resolve } from 'node:url'
import { MongoMemoryServer } from 'mongodb-memory-server'

/**
 * Zero-setup local MongoDB — `npm run db:local`.
 *
 * Downloads and runs a real mongod on port 27017, storing data in `.local-db/`
 * so it survives restarts. Meant for contributors who do not want to sign up
 * for Atlas or install Docker just to see the app run.
 *
 * For anything shared or long-lived, use Atlas — see docs/onboarding.md.
 * Leave this running in its own terminal; Ctrl-C stops it.
 */

const DB_PATH = new URL('../.local-db/', import.meta.url).pathname
const PORT = 27017

mkdirSync(DB_PATH, { recursive: true })

console.log('Starting local MongoDB (first run downloads the binary, ~90MB)...')

const mongo = await MongoMemoryServer.create({
  instance: {
    port: PORT,
    dbName: 'tracker_dev',
    dbPath: DB_PATH,
    storageEngine: 'wiredTiger',
  },
})

const uri = `mongodb://127.0.0.1:${PORT}/tracker_dev`

console.log(
  [
    '',
    '  MongoDB is running.',
    '',
    `    MONGODB_URI=${uri}`,
    '',
    '  Put that line in your .env, then in another terminal:',
    '    npm run seed',
    '    npm run dev',
    '',
    '  Data persists in .local-db/. Ctrl-C to stop.',
    '',
  ].join('\n'),
)

const stop = async () => {
  await mongo.stop()
  process.exit(0)
}
process.on('SIGINT', stop)
process.on('SIGTERM', stop)
