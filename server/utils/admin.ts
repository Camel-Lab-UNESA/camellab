import { createError, getHeader, getRequestURL } from 'h3'
import type { H3Event } from 'h3'
import { auth } from './auth'

export async function requireInternal(event: H3Event) {
  const origin = getHeader(event, 'origin')
  if (origin && origin !== getRequestURL(event, { xForwardedHost: true }).origin) {
    throw createError({ statusCode: 403, statusMessage: 'Cross-origin request blocked' })
  }

  const role = await viewerRole(event)
  if (!role) throw createError({ statusCode: 401, statusMessage: 'Sign in required' })
  if (role !== 'internal') throw createError({ statusCode: 403, statusMessage: 'Internal users only' })
}

// The signed-in user's role; undefined for visitors. Every account has one (server/utils/auth.ts).
export async function viewerRole(event: H3Event): Promise<string | undefined> {
  // Not toWebRequest(event): it starts draining the request body, and a readBody()
  // after this await then waits forever for an end event that already fired.
  const session = await auth.api.getSession({ headers: event.headers })
  return session?.user.role
}
