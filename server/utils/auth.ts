import { betterAuth } from 'better-auth'
import { APIError } from 'better-auth/api'
import { admin, createAccessControl, username } from 'better-auth/plugins'
import { Pool } from 'pg'

// No Nuxt auto-imports in this file: scripts/migrate.ts loads it with plain Node.

// `internal` is never self-assigned; promote users with SQL (see supabase/setup.sql).
const SIGNUP_ROLES = ['student', 'lecturer']

// The admin plugin ships an "admin" role out of the box; we reuse our own `internal` role for
// that instead of adding a second role string. Grant only list + ban/unban, which is all the
// admin page uses — not set-role, impersonate, delete, set-password or set-email. Role changes
// stay SQL-only (see supabase/setup.sql); broader admin API access would let any internal user
// promote themselves or others, impersonate accounts or wipe users straight through the API.
const adminStatements = {
  user: ['create', 'list', 'set-role', 'ban', 'impersonate', 'delete', 'set-password', 'set-email', 'get', 'update'],
  session: ['list', 'revoke', 'delete']
} as const
const adminAccess = createAccessControl(adminStatements)
const internalRole = adminAccess.newRole({ user: ['list', 'ban'], session: [] })
// On unless explicitly "false"; set REQUIRE_EMAIL_VERIFICATION=false in local .env to skip confirmation emails.
const requireEmailVerification = process.env.REQUIRE_EMAIL_VERIFICATION !== 'false'
const MAX_LENGTH: Record<string, number> = { name: 100, department: 100, bio: 500 }

function checkLengths(data: Record<string, unknown>) {
  for (const [field, max] of Object.entries(MAX_LENGTH)) {
    const value = data[field]
    if (typeof value === 'string' && value.length > max) {
      throw new APIError('BAD_REQUEST', { message: `${field} must be at most ${max} characters` })
    }
  }
}

const EMAILS = {
  en: {
    verify: {
      subject: 'Confirm your Camellab email',
      html: (url: string) => `<p>Confirm your email to finish signing up:</p><p><a href="${url}">Confirm email</a></p><p>If you didn't sign up, you can ignore this email.</p>`
    },
    reset: {
      subject: 'Reset your Camellab password',
      html: (url: string) => `<p>Someone asked to reset the password for your Camellab account.</p><p><a href="${url}">Choose a new password</a></p><p>The link expires in 1 hour. If this wasn't you, you can ignore this email.</p>`
    }
  },
  id: {
    verify: {
      subject: 'Konfirmasi email Camellab Anda',
      html: (url: string) => `<p>Konfirmasi email Anda untuk menyelesaikan pendaftaran:</p><p><a href="${url}">Konfirmasi email</a></p><p>Jika Anda tidak mendaftar, abaikan email ini.</p>`
    },
    reset: {
      subject: 'Atur ulang kata sandi Camellab Anda',
      html: (url: string) => `<p>Ada permintaan untuk mengatur ulang kata sandi akun Camellab Anda.</p><p><a href="${url}">Buat kata sandi baru</a></p><p>Tautan berlaku selama 1 jam. Jika ini bukan Anda, abaikan email ini.</p>`
    }
  }
}

// The language switch stores its choice in this cookie (nuxt.config.ts i18n.detectBrowserLanguage).
function emailLocale(request?: Request): keyof typeof EMAILS {
  return /(?:^|;\s*)i18n_locale=id(?:;|$)/.test(request?.headers.get('cookie') ?? '') ? 'id' : 'en'
}

async function sendEmail(to: string, subject: string, html: string) {
  if (import.meta.dev && !process.env.RESEND_API_KEY) {
    console.info(`[mail] RESEND_API_KEY not set. To: ${to}\n${subject}\n${html}`)
    return
  }
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${process.env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ from: process.env.MAIL_FROM, to, subject, html })
  })
  if (!res.ok) throw new Error(`Resend ${res.status}: ${await res.text()}`)
}

export const auth = betterAuth({
  database: new Pool({
    connectionString: process.env.DATABASE_URL,
    // Supabase signs its certs with its own CA, so verify against it instead of turning verification off.
    ssl: { ca: process.env.DATABASE_CA_CERT }
  }),
  emailAndPassword: {
    enabled: true,
    requireEmailVerification,
    revokeSessionsOnPasswordReset: true,
    sendResetPassword: ({ user, url }, request) => {
      const mail = EMAILS[emailLocale(request)].reset
      return sendEmail(user.email, mail.subject, mail.html(url))
    }
  },
  emailVerification: {
    sendOnSignUp: requireEmailVerification,
    sendOnSignIn: true,
    autoSignInAfterVerification: true,
    sendVerificationEmail: ({ user, url }, request) => {
      const mail = EMAILS[emailLocale(request)].verify
      return sendEmail(user.email, mail.subject, mail.html(url))
    }
  },
  user: {
    additionalFields: {
      role: { type: 'string', required: true, defaultValue: 'student' },
      department: { type: 'string', required: false },
      bio: { type: 'string', required: false }
    }
  },
  plugins: [username(), admin({ ac: adminAccess, roles: { internal: internalRole }, adminRoles: ['internal'], defaultRole: 'student' })],
  // The schema check delays the first auth request on every cold start; `pnpm db:migrate` owns the schema.
  advanced: { database: { validateSchema: !!import.meta.dev } },
  // Memory rate limits reset on every serverless cold start, so keep counters in Postgres.
  rateLimit: { storage: 'database' },
  databaseHooks: {
    user: {
      create: {
        before: async (user) => {
          if (!SIGNUP_ROLES.includes(user.role as string)) {
            throw new APIError('BAD_REQUEST', { message: 'Role must be student or lecturer' })
          }
          if (!user.username) throw new APIError('BAD_REQUEST', { message: 'Username is required' })
          checkLengths(user)
        }
      },
      update: {
        before: async (data, ctx) => {
          // Users edit their own profile through /update-user; role changes never go through it.
          if (ctx?.path === '/update-user' && 'role' in data) {
            throw new APIError('FORBIDDEN', { message: 'Role cannot be changed' })
          }
          checkLengths(data)
        }
      }
    }
  }
})
