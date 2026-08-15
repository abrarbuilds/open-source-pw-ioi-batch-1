import 'dotenv/config'
import { connectToDatabase, disconnectFromDatabase, mongoose } from '@repo/models/db'
import { SEED_PASSWORD, seedCore } from './core.seed'

/**
 * APPEND-ONLY — Team 01 owns this file; every team owns its own `*.seed.ts`.
 *
 * Run with `npm run seed` from the repo root. It **wipes the database first**,
 * which is why it refuses to touch anything that looks like production.
 *
 * To add your team's demo data:
 *   1. Write `scripts/seed/<feature>.seed.ts` exporting `seed<Feature>(core)`.
 *   2. Import it above and add one line to the list below.
 */

function assertNotProduction(uri: string) {
  if (process.env.NODE_ENV === 'production' || /prod/i.test(uri)) {
    throw new Error(
      'Refusing to seed: this connection string looks like production. ' +
        'Point MONGODB_URI at tracker_dev.',
    )
  }
}

async function main() {
  const uri = process.env.MONGODB_URI
  if (!uri) throw new Error('MONGODB_URI is not set. Copy .env.example to .env and fill it in.')

  assertNotProduction(uri)
  await connectToDatabase(uri)

  const dbName = mongoose.connection.name
  console.log(`Seeding "${dbName}" — dropping existing collections first.`)

  const collections = await mongoose.connection.db?.collections()
  await Promise.all((collections ?? []).map((c) => c.deleteMany({})))

  // A fixed date keeps the generated timetable identical between runs.
  const now = new Date()

  const core = await seedCore(now)
  // await seedMaterials(core)      → Team 04
  // await seedAssignments(core)    → Team 05
  // await seedAttendance(core)     → Team 06
  // await seedAnnouncements(core)  → Team 08

  console.log(
    [
      '',
      `  batch      ${core.batch.name}`,
      `  subjects   ${core.subjects.length}`,
      `  students   ${core.students.length}`,
      `  faculty    ${core.faculty.length}`,
      `  sessions   ${core.sessions.length}`,
      '',
      '  Sign in with any of these — password is the same for all:',
      `    admin       admin@college.edu     / ${SEED_PASSWORD}`,
      `    faculty     faculty1@college.edu  / ${SEED_PASSWORD}`,
      `    student     student01@college.edu / ${SEED_PASSWORD}`,
      '',
    ].join('\n'),
  )

  await disconnectFromDatabase()
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
