<script setup lang="ts">
import type { Visibility } from '~~/shared/utils/visibility'

definePageMeta({
  key: route => route.fullPath,
  validate: route => route.params.section === 'news' || route.params.section === 'articles'
})

const route = useRoute()
const { locale, t } = useI18n()
const section = route.params.section as 'news' | 'articles'

const slug = ([] as string[]).concat(route.params.slug ?? []).join('/')
const { data: post, error } = await useFetch(`/api/posts/${section}/${slug}`)
// 401: the post exists but is for signed-in readers only.
const signInToRead = error.value?.statusCode === 401
if (!post.value && !signInToRead) {
  throw createError({ statusCode: 404, statusMessage: 'Page not found', fatal: true })
}

const { data: session } = await authClient.useSession(useFetch)
const canEdit = computed(() => session.value?.user.role === 'internal')

type Draft = {
  slug: string
  sha: string
  title: string
  description: string
  date: string
  author: string
  visibility: Visibility
  body: string
}

const editing = ref(false)
const draft = ref<Draft>()
const editBusy = ref(false)
const editError = ref('')

async function startEdit() {
  if (!canEdit.value || editBusy.value) return
  editBusy.value = true
  editError.value = ''
  try {
    draft.value = await $fetch<Draft>(`/api/admin/posts/${section}/${slug}`)
    editing.value = true
  } catch (e) {
    editError.value = messageOf(e, t('errors.generic'))
  } finally {
    editBusy.value = false
  }
}

onMounted(() => {
  if (route.query.edit === '1') startEdit()
})

useSeoMeta(post.value
  ? { title: post.value.title, description: post.value.description }
  : { title: t('post.signInTitle'), robots: 'noindex' })
</script>

<template>
  <div v-if="editing && draft" class="notebook">
    <div class="widget-wide">
      <PostEditor :section="section" :post="draft" :sha="draft.sha" @cancel="editing = false" @saved="draft = { ...draft, ...$event }" />
    </div>
  </div>
  <div v-else-if="post" class="notebook">
    <NbCell>
      <div class="flex flex-wrap items-center gap-3">
        <NuxtLink :to="`/${section}`" class="link">{{ t('post.backTo', { section: t(`sections.${section}`).toLowerCase() }) }}</NuxtLink>
        <UButton v-if="canEdit" class="ms-auto" size="sm" color="neutral" variant="ghost" icon="i-lucide-pencil" :label="t('admin.edit')" :loading="editBusy" @click="startEdit" />
      </div>
      <div class="md mt-5"><h1>{{ post.title }}</h1></div>
      <p v-if="post.description" class="md-subtitle">{{ post.description }}</p>
      <p class="md-meta">
        <span>{{ t(`post.${section}`) }}</span>
        <time :datetime="new Date(post.date).toISOString()">{{ formatDate(post.date, locale) }}</time>
        <span>{{ t('post.minRead', { n: post.minutes }) }}</span>
        <span>{{ post.author }}</span>
        <span v-if="post.visibility !== 'public'"><UIcon name="i-lucide-lock" class="size-3.5 align-[-0.1em]" /> {{ t(`visibility.${post.visibility}`) }}</span>
      </p>
      <p v-if="editError" class="stderr mt-4" role="alert">{{ editError }}</p>
    </NbCell>
    <NbCell>
      <ContentRenderer :value="post" class="prose-nb" />
    </NbCell>
  </div>
  <div v-else-if="signInToRead" class="notebook">
    <NbCell>
      <NuxtLink :to="`/${section}`" class="link">{{ t('post.backTo', { section: t(`sections.${section}`).toLowerCase() }) }}</NuxtLink>
      <p class="stdout mt-5">{{ t('post.signInToRead') }}</p>
      <UButton to="/signin" size="lg" :label="t('nav.signIn')" class="mt-4" />
    </NbCell>
  </div>
</template>
