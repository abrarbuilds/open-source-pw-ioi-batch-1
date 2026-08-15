import { hashPassword } from '@repo/auth/password'
import { Batch } from '@repo/models/batch'
import { ClassSession } from '@repo/models/class-session'
import { Enrollment } from '@repo/models/enrollment'
import { Subject } from '@repo/models/subject'
import { User } from '@repo/models/user'

/**
 * Owner: Team 01 (Core Platform).
 *
 * The foundation every other seeder builds on: one batch, six subjects, one
 * admin, three faculty, forty students, and four weeks of class sessions.
 *
 * Everything here is deterministic — same data every run — so a bug that only
 * appears with certain data is reproducible for whoever reviews your PR.
 */

export const SEED_PASSWORD = 'password123'

const SUBJECTS = [
  { name: 'Data Structures', code: 'CS201', credits: 4 },
  { name: 'Database Management Systems', code: 'CS202', credits: 4 },
  { name: 'Operating Systems', code: 'CS203', credits: 4 },
  { name: 'Computer Networks', code: 'CS204', credits: 3 },
  { name: 'Web Development', code: 'CS205', credits: 3 },
  { name: 'Discrete Mathematics', code: 'MA201', credits: 3 },
]

const FIRST_NAMES = [
  'Aarav', 'Diya', 'Vihaan', 'Ananya', 'Arjun', 'Ishita', 'Reyansh', 'Saanvi',
  'Kabir', 'Myra', 'Aditya', 'Aadhya', 'Rohan', 'Kiara', 'Vivaan', 'Anika',
  'Krishna', 'Navya', 'Ayaan', 'Riya',
]

const LAST_NAMES = [
  'Sharma', 'Verma', 'Reddy', 'Nair', 'Iyer', 'Patel', 'Gupta', 'Rao',
  'Singh', 'Menon',
]

/** Monday of the week four weeks before `from`, at 09:00 local time. */
function startOfSeedTerm(from: Date): Date {
  const start = new Date(from)
  start.setDate(start.getDate() - 28)
  start.setHours(9, 0, 0, 0)
  // Roll back to Monday.
  const daysSinceMonday = (start.getDay() + 6) % 7
  start.setDate(start.getDate() - daysSinceMonday)
  return start
}

export async function seedCore(now: Date) {
  const passwordHash = await hashPassword(SEED_PASSWORD)

  const batch = await Batch.create({
    name: 'PW IOI Batch 1',
    year: now.getFullYear(),
    program: 'B.Tech Computer Science',
    startDate: startOfSeedTerm(now),
  })

  const admin = await User.create({
    name: 'Priya Menon',
    email: 'admin@college.edu',
    passwordHash,
    role: 'ADMIN',
    batchId: batch._id,
  })

  const faculty = await User.insertMany(
    ['Anil Kumar', 'Sneha Joshi', 'Ravi Prasad'].map((name, i) => ({
      name,
      email: `faculty${i + 1}@college.edu`,
      passwordHash,
      role: 'FACULTY' as const,
      batchId: batch._id,
    })),
  )

  const subjects = await Subject.insertMany(
    SUBJECTS.map((subject, i) => ({
      ...subject,
      batchId: batch._id,
      facultyId: faculty[i % faculty.length]!._id,
    })),
  )

  const students = await User.insertMany(
    Array.from({ length: 40 }, (_, i) => {
      const first = FIRST_NAMES[i % FIRST_NAMES.length]!
      const last = LAST_NAMES[Math.floor(i / FIRST_NAMES.length) % LAST_NAMES.length]!
      return {
        name: `${first} ${last}`,
        email: `student${String(i + 1).padStart(2, '0')}@college.edu`,
        passwordHash,
        role: 'STUDENT' as const,
        batchId: batch._id,
      }
    }),
  )

  // Everyone takes every subject — realistic for a single batch, and it means
  // any student login has data on every screen.
  await Enrollment.insertMany(
    students.flatMap((student) =>
      subjects.map((subject) => ({
        studentId: student._id,
        subjectId: subject._id,
        batchId: batch._id,
      })),
    ),
  )

  // Eight weeks of classes, each subject meeting once a week, starting four
  // weeks ago. That deliberately straddles today: roughly half the sessions are
  // in the past (so Team 06 has attendance to mark against) and half are ahead
  // (so Team 07's timetable and "today's classes" have something to show).
  const termStart = startOfSeedTerm(now)
  const sessions = await ClassSession.insertMany(
    subjects.flatMap((subject, subjectIndex) =>
      Array.from({ length: 8 }, (_, week) => {
        const scheduledAt = new Date(termStart)
        scheduledAt.setDate(termStart.getDate() + week * 7 + (subjectIndex % 5))
        scheduledAt.setHours(9 + Math.floor(subjectIndex / 5) * 2, 0, 0, 0)
        return {
          subjectId: subject._id,
          title: `${subject.name} — Week ${week + 1}`,
          scheduledAt,
          durationMins: 60,
          room: `LH-${101 + (subjectIndex % 6)}`,
          facultyId: subject.facultyId,
        }
      }),
    ),
  )

  return { batch, admin, faculty, subjects, students, sessions }
}

export type CoreSeed = Awaited<ReturnType<typeof seedCore>>
