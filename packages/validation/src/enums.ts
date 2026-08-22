import { z } from 'zod'

/**
 * Shared enums. These are the vocabulary of the whole system, so they live in
 * `@repo/validation` — the one package with no dependencies of its own. Both
 * `@repo/models` and `@repo/auth` import from here.
 *
 * Adding a value is a contract change: open an issue before you do it.
 */

export const roleSchema = z.enum(['STUDENT', 'FACULTY', 'ADMIN'])
export type Role = z.infer<typeof roleSchema>

export const attendanceStatusSchema = z.enum(['PRESENT', 'ABSENT', 'LATE', 'EXCUSED'])
export type AttendanceStatus = z.infer<typeof attendanceStatusSchema>

export const submissionStatusSchema = z.enum(['SUBMITTED', 'LATE', 'GRADED'])
export type SubmissionStatus = z.infer<typeof submissionStatusSchema>

export const materialTypeSchema = z.enum(['PPT', 'PDF', 'DOC', 'VIDEO', 'LINK', 'OTHER'])
export type MaterialType = z.infer<typeof materialTypeSchema>

export const notificationTypeSchema = z.enum([
  'MATERIAL_ADDED',
  'ASSIGNMENT_PUBLISHED',
  'ASSIGNMENT_DUE_SOON',
  'SUBMISSION_GRADED',
  'ATTENDANCE_LOW',
  'ANNOUNCEMENT',
])
export type NotificationType = z.infer<typeof notificationTypeSchema>

export const bookmarkTargetSchema = z.enum(['MATERIAL', 'ASSIGNMENT', 'ANNOUNCEMENT'])
export type BookmarkTarget = z.infer<typeof bookmarkTargetSchema>

/** Roles allowed to authenticate against `api-admin`. */
export const ADMIN_PORTAL_ROLES: readonly Role[] = ['ADMIN', 'FACULTY']
