// Creates or updates the Better Auth tables. Run after changing auth fields or plugins.
import { getMigrations } from 'better-auth/db/migration'
import { auth } from '../server/utils/auth.ts'

const { toBeCreated, toBeAdded, runMigrations } = await getMigrations(auth.options)
console.log('New tables:', toBeCreated.map(t => t.table).join(', ') || 'none')
console.log('New columns on:', toBeAdded.map(t => t.table).join(', ') || 'none')
await runMigrations()
console.log('Done')
process.exit(0)
