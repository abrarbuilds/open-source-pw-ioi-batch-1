import { Bookmark } from '@repo/models/bookmark'
import { Material } from '@repo/models/material'
import { Note } from '@repo/models/note'
import type { CoreSeed } from './core.seed'

/**
 * Owner: Team 09 — Student Profile & Notes.
 *
 * Notes and bookmarks for the first few students. Everything here belongs to a
 * specific student, which makes this the easiest seed to write a privacy test
 * against: student02 must never see student01's notes.
 */
export async function seedNotes(core: CoreSeed) {
  const students = core.students.slice(0, 3)

  const notes = students.flatMap((student, i) =>
    core.subjects.slice(0, 3).map((subject, j) => ({
      studentId: student._id,
      subjectId: subject._id,
      sessionId: null,
      title: `${subject.code} — revision points`,
      body:
        j === 0
          ? 'Re-read the complexity table before the exam. Ask about amortised analysis.'
          : 'Practice questions from the end of the slide deck.',
      pinned: i === 0 && j === 0,
    })),
  )

  await Note.insertMany(notes)

  // Bookmark the first two materials of each subject for the first student.
  const materials = await Material.find({}).limit(6).lean()
  const first = students[0]

  const bookmarks = first
    ? materials.slice(0, 4).map((m) => ({
        studentId: first._id,
        entityType: 'MATERIAL' as const,
        entityId: m._id,
      }))
    : []

  if (bookmarks.length) await Bookmark.insertMany(bookmarks)

  return { notes: notes.length, bookmarks: bookmarks.length }
}
