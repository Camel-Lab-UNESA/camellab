import { createAuthClient } from 'better-auth/vue'
import { adminClient, inferAdditionalFields, usernameClient } from 'better-auth/client/plugins'
import type { auth } from '~~/server/utils/auth'

export const authClient = createAuthClient({
  plugins: [usernameClient(), adminClient(), inferAdditionalFields<typeof auth>()]
})
