import { Announcement } from '@repo/models/announcement'
import { Notification } from '@repo/models/notification'
import type { CoreSeed } from './core.seed'

/**
 * Owner: Team 08 — Announcements & Notifications.
 *
 * A batch-wide feed plus a few per-subject posts, and unread notifications for
 * the first student so the bell has a non-zero count on first load.
 */
export async function seedAnnouncements(core: CoreSeed, now: Date) {
  const daysAgo = (n: number) => new Date(now.getTime() - n * 24 * 60 * 60 * 1000)

  const announcements = await Announcement.insertMany([
    {
      batchId: core.batch._id,
      subjectId: null,
      title: 'Mid-semester exam schedule published',
      body: 'The mid-semester timetable is up. Exams run over five days starting the first Monday of next month. Check your timetable for room allocations.',
      pinned: true,
      authorId: core.admin._id,
      createdAt: daysAgo(2),
    },
    {
      batchId: core.batch._id,
      subjectId: null,
      title: 'Library extended hours during exams',
      body: 'The library will stay open until 11pm on weekdays for the next three weeks.',
      pinned: false,
      authorId: core.admin._id,
      createdAt: daysAgo(5),
    },
    {
      batchId: core.batch._id,
      subjectId: core.subjects[1]?._id ?? null,
      title: 'DBMS lab rescheduled',
      body: "Thursday's lab moves to Friday 2pm this week only. Same room.",
      pinned: false,
      authorId: core.faculty[0]?._id ?? core.admin._id,
      createdAt: daysAgo(1),
    },
    {
      batchId: core.batch._id,
      subjectId: core.subjects[0]?._id ?? null,
      title: 'Extra doubt-clearing session for Data Structures',
      body: 'Optional session on trees and traversal this Saturday at 10am.',
      pinned: false,
      authorId: core.faculty[1]?._id ?? core.admin._id,
      createdAt: daysAgo(3),
    },
  ])

  // Unread notifications for the first two students, so the bell shows a count.
  const targets = core.students.slice(0, 2)
  const notifications = targets.flatMap((student) => [
    {
      userId: student._id,
      type: 'ANNOUNCEMENT' as const,
      title: 'Mid-semester exam schedule published',
      body: 'Check your timetable for room allocations.',
      href: '/announcements',
      readAt: null,
    },
    {
      userId: student._id,
      type: 'ASSIGNMENT_DUE_SOON' as const,
      title: 'An assignment is due in 3 days',
      body: 'CS202 Assignment 2',
      href: '/assignments',
      readAt: null,
    },
    {
      userId: student._id,
      type: 'MATERIAL_ADDED' as const,
      title: 'New material in Operating Systems',
      body: 'Virtual memory',
      href: '/materials',
      readAt: daysAgo(1),
    },
  ])

  await Notification.insertMany(notifications)

  return { announcements: announcements.length, notifications: notifications.length }
}
