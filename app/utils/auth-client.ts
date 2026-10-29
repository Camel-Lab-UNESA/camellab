import { createAuthClient } from 'better-auth/vue'
import { adminClient, inferAdditionalFields, usernameClient } from 'better-auth/client/plugins'
import type { auth } from '~~/server/utils/auth'

export const authClient = createAuthClient({
  plugins: [usernameClient(), adminClient(), inferAdditionalFields<typeof auth>()]
})

// useSession(useFetch) fetches an absolute URL, and on Vercel's server better-auth takes that
// origin from VERCEL_URL: the per-deployment URL behind Vercel's login wall, which answers with
// an HTML page instead of the session. A plain path keeps the SSR fetch in-process.
export const useAuthSession = () => authClient.useSession((_url, options) => useFetch('/api/auth/get-session', options))
