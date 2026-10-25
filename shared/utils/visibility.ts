// Who can read a post. Signup roles are student and lecturer; internal is assigned by hand.
export const VISIBILITIES = ['public', 'members', 'students', 'lecturers', 'internal'] as const
export type Visibility = (typeof VISIBILITIES)[number]

export function isVisibility(value: unknown): value is Visibility {
  return typeof value === 'string' && (VISIBILITIES as readonly string[]).includes(value)
}

// Internal users read everything; any signed-in user reads members posts, plus the posts for their own role.
export function visibleTo(role?: string): Visibility[] {
  if (role === 'internal') return [...VISIBILITIES]
  if (!role) return ['public']
  if (role === 'student') return ['public', 'members', 'students']
  if (role === 'lecturer') return ['public', 'members', 'lecturers']
  return ['public', 'members']
}
