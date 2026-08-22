import { Attendance } from '@repo/models/attendance'
import type { AttendanceStatus } from '@repo/validation/enums'
import type { CoreSeed } from './core.seed'

/**
 * Owner: Team 06 — Attendance.
 *
 * Marks every session that has already happened, for every student. This is the
 * largest collection in the seed (students × past sessions), which is the point:
 * Teams 06, 09, 12 and 13 all need enough rows that a naive JavaScript loop
 * feels slow and an aggregation pipeline does not.
 *
 * The pattern is deterministic, so the percentage a student sees is reproducible
 * and can be asserted in a test. Roughly: 1 in 11 absent, 1 in 11 late, one
 * student (index 3) deliberately pushed below 75% so the at-risk report and the
 * low-attendance warning have someone to find.
 */
function statusFor(studentIndex: number, sessionIndex: number): AttendanceStatus {
  // Student 3 is the designated at-risk case — absent far more often.
  if (studentIndex === 3) return sessionIndex % 3 === 0 ? 'PRESENT' : 'ABSENT'

  const n = (studentIndex * 3 + sessionIndex * 5) % 11
  if (n === 0) return 'ABSENT'
  if (n === 1) return 'LATE'
  if (studentIndex % 17 === 0 && sessionIndex % 8 === 0) return 'EXCUSED'
  return 'PRESENT'
}

export async function seedAttendance(core: CoreSeed, now: Date) {
  const pastSessions = core.sessions.filter((s) => s.scheduledAt.getTime() < now.getTime())

  const docs = pastSessions.flatMap((session, sessionIndex) =>
    core.students.map((student, studentIndex) => ({
      sessionId: session._id,
      // Denormalised so per-subject percentages need no $lookup.
      subjectId: session.subjectId,
      studentId: student._id,
      status: statusFor(studentIndex, sessionIndex),
      markedBy: session.facultyId ?? core.admin._id,
      markedAt: new Date(session.scheduledAt.getTime() + 10 * 60 * 1000),
      note: null,
    })),
  )

  await Attendance.insertMany(docs)

  return { pastSessions: pastSessions.length, records: docs.length }
}
