import type { Role } from '@repo/validation/enums'

export interface NavItem {
  id: string
  label: string
  href: string
  glyph: string
  /** Omit to show to both ADMIN and FACULTY. Set `['ADMIN']` for admin-only screens. */
  roles?: Role[]
  order: number
}
