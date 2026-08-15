import { Assignment } from '@repo/models/assignment'
import { Submission } from '@repo/models/submission'
import type { CoreSeed } from './core.seed'

/**
 * Owner: Team 05 — Assignments & Submissions.
 *
 * Produces a realistic mix on purpose: some assignments past their deadline and
 * fully graded, some open, one still a draft. Not every student submits, and
 * some submit late — the awkward cases are the ones worth having in dev data.
 *
 * Everything is deterministic (no randomness), so "student 7 is missing two
 * submissions" is true on every machine.
 */
export async function seedAssignments(core: CoreSeed, now: Date) {
  const assignments = await Assignment.insertMany(
    core.subjects.flatMap((subject) =>
      [0, 1, 2].map((n) => {
        // n=0 closed two weeks ago, n=1 due in three days, n=2 unpublished draft.
        const dueAt = new Date(now)
        dueAt.setDate(dueAt.getDate() + (n === 0 ? -14 : n === 1 ? 3 : 21))
        dueAt.setHours(23, 59, 0, 0)

        return {
          subjectId: subject._id,
          title: `${subject.code} Assignment ${n + 1}`,
          description: `Complete the exercises for ${subject.name}, unit ${n + 1}. Submit a single PDF.`,
          dueAt,
          maxMarks: n === 0 ? 20 : 25,
          attachments: [],
          createdBy: subject.facultyId ?? core.admin._id,
          isPublished: n !== 2,
        }
      }),
    ),
  )

  // Only the closed assignments (n === 0) have submissions worth grading.
  const closed = assignments.filter((a) => a.dueAt.getTime() < now.getTime())

  const submissions = closed.flatMap((assignment, assignmentIndex) =>
    core.students
      // Deterministic ~85% submission rate — students whose index lands on the
      // gap are the "missing submission" cases Team 12's at-risk report needs.
      .filter((_, studentIndex) => (studentIndex * 7 + assignmentIndex * 3) % 13 !== 0)
      .map((student, i) => {
        const isLate = (i + assignmentIndex) % 9 === 0
        const submittedAt = new Date(assignment.dueAt)
        submittedAt.setHours(submittedAt.getHours() + (isLate ? 6 : -18))

        // Marks spread across the range so averages and distributions are
        // interesting rather than all identical.
        const marks = Math.round(assignment.maxMarks * (0.55 + ((i * 13) % 40) / 100))

        return {
          assignmentId: assignment._id,
          studentId: student._id,
          files: [
            {
              publicId: `seed/sub-${assignment._id.toString()}-${student._id.toString()}`,
              url: `https://res.cloudinary.com/demo/raw/upload/seed/submission.pdf`,
              name: 'submission.pdf',
              bytes: 120_000 + i * 1_000,
            },
          ],
          note: null,
          submittedAt,
          status: 'GRADED' as const,
          marks,
          feedback: marks >= assignment.maxMarks * 0.8 ? 'Good work.' : 'Review the feedback in class.',
          gradedBy: assignment.createdBy,
          gradedAt: new Date(submittedAt.getTime() + 3 * 24 * 60 * 60 * 1000),
        }
      }),
  )

  await Submission.insertMany(submissions)

  return { assignments, submissionCount: submissions.length }
}
