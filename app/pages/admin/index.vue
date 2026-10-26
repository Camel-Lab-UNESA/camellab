<script setup lang="ts">
import type { Visibility } from '~~/shared/utils/visibility'

definePageMeta({ middleware: 'internal' })

const { t } = useI18n()
const authError = useAuthError()
const sections = ['news', 'articles'] as const
type Section = (typeof sections)[number]

type PostSummary = { slug: string, sha: string, title: string, date: string, visibility: Visibility }
type AdminUser = { id: string, name: string, email: string, username?: string | null, role: string, banned?: boolean | null }

const section = ref<Section>('articles')
const posts = ref<PostSummary[]>([])
const listBusy = ref(false)
const busy = ref(false)
const error = ref('')
const notice = ref('')

const users = ref<AdminUser[]>([])
const usersBusy = ref(false)
const usersError = ref('')
const usersNotice = ref('')

useSeoMeta({ title: () => t('admin.title'), robots: 'noindex' })

async function loadPosts() {
  listBusy.value = true
  error.value = ''
  try {
    posts.value = await $fetch<PostSummary[]>('/api/admin/posts', { query: { section: section.value } })
  } catch (e) {
    error.value = messageOf(e, t('errors.generic'))
  } finally {
    listBusy.value = false
  }
}

function setSection(value: Section) {
  if (section.value === value) return
  section.value = value
  loadPosts()
}

async function remove(slug: string, sha: string) {
  if (!confirm(t('admin.confirmDelete'))) return

  busy.value = true
  error.value = ''
  notice.value = ''
  try {
    await $fetch(`/api/admin/posts/${section.value}/${slug}`, { method: 'DELETE', body: { sha } })
    notice.value = t('admin.deleted')
    loadPosts()
  } catch (e) {
    error.value = messageOf(e, t('errors.generic'))
  } finally {
    busy.value = false
  }
}

async function loadUsers() {
  usersBusy.value = true
  usersError.value = ''
  const { data, error: err } = await authClient.admin.listUsers({ query: { limit: 200, sortBy: 'createdAt', sortDirection: 'desc' } })
  if (err) usersError.value = authError(err)
  else users.value = (data?.users ?? []) as AdminUser[]
  usersBusy.value = false
}

async function toggleBan(user: AdminUser) {
  if (!confirm(t(user.banned ? 'admin.users.confirmUnban' : 'admin.users.confirmBan', { name: user.name }))) return

  let reason: string | undefined
  if (!user.banned) {
    const input = prompt(t('admin.users.banReasonPrompt'))
    if (input === null) return
    reason = input || undefined
  }

  usersBusy.value = true
  usersError.value = ''
  usersNotice.value = ''
  const { error: err } = user.banned
    ? await authClient.admin.unbanUser({ userId: user.id })
    : await authClient.admin.banUser({ userId: user.id, banReason: reason })
  if (err) usersError.value = authError(err)
  else {
    usersNotice.value = t(user.banned ? 'admin.users.unbannedNotice' : 'admin.users.bannedNotice')
    await loadUsers()
  }
  usersBusy.value = false
}

onMounted(() => {
  loadUsers()
  loadPosts()
})
</script>

<template>
  <div class="notebook">
    <NbCell>
      <div class="md"><h1>{{ t('admin.title') }}</h1></div>
      <p class="md-meta">{{ t('admin.subtitle') }}</p>
    </NbCell>

    <NbCell code="admin.users()" :busy="usersBusy" :error="!!usersError">
      <div class="md"><h2>{{ t('admin.users.title') }}</h2></div>

      <p v-if="usersBusy && !users.length" class="stdout mt-4">{{ t('nb.running') }}</p>
      <p v-else-if="!users.length" class="stdout mt-4">{{ t('admin.users.noUsers') }}</p>
      <ul v-else class="mt-2 divide-y divide-[var(--mist)]">
        <li v-for="user in users" :key="user.id" class="flex flex-wrap items-center gap-3 py-3">
          <div class="min-w-0 flex-1">
            <p class="font-semibold [overflow-wrap:anywhere]">
              {{ user.name }}
              <span v-if="user.banned" class="mono text-xs text-[var(--err-ink)]">· {{ t('admin.users.banned') }}</span>
            </p>
            <p class="md-meta [overflow-wrap:anywhere]">
              {{ user.email }}<template v-if="user.username"> · @{{ user.username }}</template> · {{ t(`profile.roles.${user.role}`) }}
            </p>
          </div>
          <UButton
            size="sm"
            :color="user.banned ? 'neutral' : 'error'"
            variant="ghost"
            :icon="user.banned ? 'i-lucide-shield-check' : 'i-lucide-shield-ban'"
            :label="t(user.banned ? 'admin.users.unban' : 'admin.users.ban')"
            @click="toggleBan(user)"
          />
        </li>
      </ul>

      <p v-if="usersNotice" class="stdout mt-4" role="status">
        <UIcon name="i-lucide-check" class="ok size-4 align-[-0.15em]" /> {{ usersNotice }}
      </p>
      <p v-if="usersError" class="stderr mt-4" role="alert">{{ usersError }}</p>
    </NbCell>

    <NbCell code="admin.posts()" :busy="busy || listBusy" :error="!!error">
      <div class="md"><h2>{{ t('admin.postsTitle') }}</h2></div>
      <div class="mt-4 flex flex-wrap items-center gap-2">
        <UButton
          v-for="s in sections"
          :key="s"
          :label="t(`sections.${s}`)"
          color="neutral"
          :variant="section === s ? 'solid' : 'ghost'"
          size="sm"
          @click="setSection(s)"
        />
        <UButton class="ms-auto" :label="t('admin.new')" icon="i-lucide-plus" size="sm" :to="`/${section}/new`" />
      </div>

      <p v-if="listBusy" class="stdout mt-4">{{ t('nb.running') }}</p>
      <p v-else-if="!posts.length" class="stdout mt-4">{{ t('admin.noPosts') }}</p>
      <ul v-else class="mt-2 divide-y divide-[var(--mist)]">
        <li v-for="post in posts" :key="post.slug" class="flex flex-wrap items-center gap-3 py-3">
          <div class="min-w-0 flex-1">
            <p class="font-semibold [overflow-wrap:anywhere]">{{ post.title }}</p>
            <p class="md-meta">
              {{ post.slug }}<template v-if="post.date"> · {{ post.date }}</template>
              <template v-if="post.visibility !== 'public'"> · <UIcon name="i-lucide-lock" class="size-3 align-[-0.1em]" aria-hidden="true" /> {{ t(`visibility.${post.visibility}`) }}</template>
            </p>
          </div>
          <UButton size="sm" color="neutral" variant="ghost" icon="i-lucide-pencil" :aria-label="t('admin.edit')" :to="`/${section}/${post.slug}?edit=1`" />
          <UButton size="sm" color="neutral" variant="ghost" icon="i-lucide-trash-2" :aria-label="t('admin.delete')" @click="remove(post.slug, post.sha)" />
        </li>
      </ul>

      <p v-if="notice" class="stdout mt-4" role="status">
        <UIcon name="i-lucide-check" class="ok size-4 align-[-0.15em]" /> {{ notice }}
      </p>
      <p v-if="error" class="stderr mt-4" role="alert">{{ error }}</p>
    </NbCell>
  </div>
</template>
