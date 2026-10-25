import { createError, getHeader, getRequestURL, toWebRequest } from 'h3'
import type { H3Event } from 'h3'
import { auth } from './auth'

export async function requireInternal(event: H3Event) {
  const origin = getHeader(event, 'origin')
  if (origin && origin !== getRequestURL(event, { xForwardedHost: true }).origin) {
    throw createError({ statusCode: 403, statusMessage: 'Cross-origin request blocked' })
  }

  const session = await auth.api.getSession({ headers: toWebRequest(event).headers })
  if (!session) throw createError({ statusCode: 401, statusMessage: 'Sign in required' })
  if (session.user.role !== 'internal') throw createError({ statusCode: 403, statusMessage: 'Internal users only' })

  return session.user
}
