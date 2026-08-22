import type { Role } from '@repo/validation/enums'

export interface NavItem {
  /** Stable key — also used as the React key. */
  id: string
  label: string
  href: string
  /** Single-character glyph. Team 02 swaps these for real icons in W8. */
  glyph: string
  /** Omit to show the item to everyone who can reach the dashboard. */
  roles?: Role[]
  /** Lower numbers sort first. Leave gaps so teams can insert without renumbering. */
  order: number
}
