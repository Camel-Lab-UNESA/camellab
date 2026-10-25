<script setup lang="ts">
import type { Editor, JSONContent } from '@tiptap/vue-3'
import { VISIBILITIES } from '~~/shared/utils/visibility'
import type { Visibility } from '~~/shared/utils/visibility'

definePageMeta({ middleware: 'internal' })

const { t } = useI18n()
const { data: session } = await authClient.useSession(useFetch)
const sections = ['news', 'articles'] as const
type Section = (typeof sections)[number]

type PostSummary = { slug: string, sha: string, title: string, date: string, visibility: Visibility }
type PostDetail = PostSummary & { description: string, author: string, body: string }

const section = ref<Section>('articles')
const posts = ref<PostSummary[]>([])
const listBusy = ref(false)
const busy = ref(false)
const editing = ref<string | null>(null)
const editingSha = ref<string>()
const error = ref('')
const notice = ref('')
const form = reactive({ title: '', slug: '', description: '', date: today(), author: '', visibility: 'public' as Visibility, body: '' })
const visibilityItems = computed(() => VISIBILITIES.map(value => ({ label: t(`visibility.${value}`), value })))

useSeoMeta({ title: () => t('admin.title'), robots: 'noindex' })

const modes = ['visual', 'markdown'] as const
const mode = ref<(typeof modes)[number]>('visual')
const tool = (icon: string, key: string, extra: Record<string, unknown>) => ({ icon, tooltip: { text: t(`admin.editor.${key}`) }, 'aria-label': t(`admin.editor.${key}`), ...extra })
const editorItems = computed(() => [
  [tool('i-lucide-undo-2', 'undo', { kind: 'undo' }), tool('i-lucide-redo-2', 'redo', { kind: 'redo' })],
  [tool('i-lucide-heading-2', 'heading', { kind: 'heading', level: 2 }), tool('i-lucide-heading-3', 'subheading', { kind: 'heading', level: 3 })],
  [tool('i-lucide-bold', 'bold', { kind: 'mark', mark: 'bold' }), tool('i-lucide-italic', 'italic', { kind: 'mark', mark: 'italic' })],
  [tool('i-lucide-list', 'bulletList', { kind: 'bulletList' }), tool('i-lucide-list-ordered', 'orderedList', { kind: 'orderedList' }), tool('i-lucide-text-quote', 'quote', { kind: 'blockquote' })],
  [tool('i-lucide-link', 'link', { kind: 'link' })]
])

const editorRef = useTemplateRef<{ editor?: Editor }>('editorRef')
const fileInput = useTemplateRef<HTMLInputElement>('fileInput')
const uploading = ref(false)

// Visual mode inserts at the cursor; Markdown mode adds a paragraph at the end.
function insertBlock(markdown: string, node: JSONContent) {
  const editor = mode.value === 'visual' ? editorRef.value?.editor : undefined
  if (editor) editor.chain().focus().insertContent(node).run()
  else form.body = `${form.body.trimEnd()}\n\n${markdown}\n`
}

async function uploadImage(event: Event) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  input.value = ''
  if (!file) return
  error.value = ''
  if (file.size > 4 * 1024 * 1024) {
    error.value = t('admin.editor.imageTooLarge')
    return
  }
  const alt = prompt(t('admin.editor.imageAlt'), file.name.replace(/\.[^.]+$/, ''))?.replace(/[[\]\n]/g, ' ').trim()
  if (alt === undefined) return

  uploading.value = true
  try {
    const body = new FormData()
    body.append('file', file)
    const { url } = await $fetch<{ url: string }>('/api/admin/uploads', { method: 'POST', body })
    insertBlock(`![${alt}](${url})`, { type: 'image', attrs: { src: url, alt } })
  } catch (e) {
    error.value = messageOf(e)
  } finally {
    uploading.value = false
  }
}

function addVideo() {
  const url = prompt(t('admin.editor.videoPrompt'))?.trim()
  if (!url) return
  if (!youtubeId(url)) {
    error.value = t('admin.editor.videoInvalid')
    return
  }
  error.value = ''
  insertBlock(url, { type: 'paragraph', content: [{ type: 'text', text: url, marks: [{ type: 'link', attrs: { href: url } }] }] })
}

function today() {
  return new Date().toISOString().slice(0, 10)
}

function reset() {
  editing.value = null
  editingSha.value = undefined
  form.title = ''
  form.slug = ''
  form.description = ''
  form.date = today()
  form.author = session.value?.user.name ?? ''
  form.visibility = 'public'
  form.body = ''
  error.value = ''
  notice.value = ''
}

async function loadPosts() {
  listBusy.value = true
  try {
    posts.value = await $fetch<PostSummary[]>('/api/admin/posts', { query: { section: section.value } })
  } catch (e) {
    error.value = messageOf(e)
  } finally {
    listBusy.value = false
  }
}

function setSection(value: Section) {
  if (section.value === value) return
  section.value = value
  reset()
  loadPosts()
}

async function editPost(slug: string) {
  busy.value = true
  error.value = ''
  notice.value = ''
  try {
    const post = await $fetch<PostDetail>(`/api/admin/posts/${section.value}/${slug}`)
    editing.value = slug
    editingSha.value = post.sha
    form.title = post.title
    form.slug = post.slug
    form.description = post.description
    form.date = post.date
    form.author = post.author
    form.visibility = post.visibility
    form.body = post.body
  } catch (e) {
    error.value = messageOf(e)
  } finally {
    busy.value = false
  }
}

async function save() {
  error.value = ''
  notice.value = ''
  if (!form.title.trim() || !form.description.trim() || !form.date || !form.author.trim() || !form.body.trim()) {
    error.value = t('admin.required')
    return
  }

  const slug = (form.slug || slugify(form.title)).trim()
  if (slug.length > 80 || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
    error.value = t('admin.invalidSlug')
    return
  }

  busy.value = true
  try {
    const result = await $fetch<{ contentSha: string, commitUrl: string, slug: string }>(`/api/admin/posts/${section.value}/${slug}`, {
      method: 'PUT',
      body: { ...form, slug, sha: editingSha.value }
    })
    form.slug = slug
    editing.value = slug
    editingSha.value = result.contentSha
    notice.value = t('admin.saved')
    loadPosts()
  } catch (e) {
    error.value = messageOf(e)
  } finally {
    busy.value = false
  }
}

async function remove(slug: string, sha: string) {
  if (!confirm(t('admin.confirmDelete'))) return

  busy.value = true
  error.value = ''
  notice.value = ''
  try {
    await $fetch(`/api/admin/posts/${section.value}/${slug}`, { method: 'DELETE', body: { sha } })
    if (editing.value === slug) reset()
    notice.value = t('admin.deleted')
    loadPosts()
  } catch (e) {
    error.value = messageOf(e)
  } finally {
    busy.value = false
  }
}

function removeCurrent() {
  if (editing.value && editingSha.value) remove(editing.value, editingSha.value)
}

function messageOf(e: unknown) {
  const err = e as { data?: { statusMessage?: string }, statusMessage?: string, message?: string }
  return err.data?.statusMessage ?? err.statusMessage ?? err.message ?? t('errors.generic')
}

onMounted(() => {
  reset()
  loadPosts()
})
</script>

<template>
  <div class="notebook">
    <NbCell>
      <div class="md"><h1>{{ t('admin.title') }}</h1></div>
      <p class="md-meta">{{ t('admin.subtitle') }}</p>
    </NbCell>

    <NbCell code="admin.posts()">
      <div class="flex flex-wrap items-center gap-2">
        <UButton
          v-for="s in sections"
          :key="s"
          :label="t(`sections.${s}`)"
          color="neutral"
          :variant="section === s ? 'solid' : 'ghost'"
          size="sm"
          @click="setSection(s)"
        />
        <UButton class="ms-auto" :label="t('admin.new')" icon="i-lucide-plus" size="sm" @click="reset" />
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
          <UButton size="sm" color="neutral" variant="ghost" icon="i-lucide-pencil" :aria-label="t('admin.edit')" @click="editPost(post.slug)" />
          <UButton size="sm" color="neutral" variant="ghost" icon="i-lucide-trash-2" :aria-label="t('admin.delete')" @click="remove(post.slug, post.sha)" />
        </li>
      </ul>
    </NbCell>

    <NbCell :code="editing ? 'admin.update()' : 'admin.publish()'" :busy="busy" :error="!!error">
      <UForm :state="form" class="widget-wide space-y-5" @submit="save">
        <UFormField :label="t('admin.titleField')" required>
          <UInput v-model="form.title" size="lg" class="w-full" maxlength="200" />
        </UFormField>
        <UFormField :label="t('admin.slug')" :hint="t('admin.slugHint')">
          <UInput v-model="form.slug" size="lg" class="w-full" maxlength="80" :disabled="!!editing" />
        </UFormField>
        <UFormField :label="t('admin.description')" required>
          <UInput v-model="form.description" size="lg" class="w-full" maxlength="300" />
        </UFormField>
        <div class="grid gap-5 sm:grid-cols-2">
          <UFormField :label="t('admin.date')" required>
            <UInput v-model="form.date" type="date" size="lg" class="w-full" />
          </UFormField>
          <UFormField :label="t('admin.author')" required>
            <UInput v-model="form.author" size="lg" class="w-full" maxlength="100" />
          </UFormField>
        </div>
        <UFormField :label="t('admin.visibility')" :hint="t('admin.visibilityHint')" required>
          <USelect v-model="form.visibility" :items="visibilityItems" size="lg" class="w-full sm:w-72" />
        </UFormField>
        <UFormField :label="t('admin.body')" required>
          <div class="mb-2 flex flex-wrap gap-1">
            <UButton
              v-for="m in modes"
              :key="m"
              :label="t(`admin.editor.${m}`)"
              color="neutral"
              :variant="mode === m ? 'solid' : 'ghost'"
              size="xs"
              :aria-pressed="mode === m"
              @click="mode = m"
            />
            <UButton class="ms-auto" icon="i-lucide-image-plus" :label="t('admin.editor.image')" color="neutral" variant="ghost" size="xs" :loading="uploading" @click="fileInput?.click()" />
            <UButton icon="i-lucide-youtube" :label="t('admin.editor.video')" color="neutral" variant="ghost" size="xs" @click="addVideo" />
            <input ref="fileInput" type="file" accept="image/png,image/jpeg,image/gif,image/webp" class="hidden" @change="uploadImage">
          </div>
          <div class="grid gap-4 lg:grid-cols-2">
            <UTextarea v-if="mode === 'markdown'" v-model="form.body" size="lg" class="w-full font-mono" :rows="16" autoresize />
            <UEditor v-else ref="editorRef" v-slot="{ editor }" v-model="form.body" content-type="markdown" class="min-h-80 rounded-md border border-[var(--mist)]" :ui="{ base: 'p-4' }">
              <UEditorToolbar :editor="editor" :items="editorItems" class="overflow-x-auto border-b border-[var(--mist)] p-1" />
            </UEditor>
            <div class="min-w-0 rounded-md border border-[var(--mist)] p-4">
              <p class="md-meta mb-3">{{ t('admin.editor.preview') }}</p>
              <MDC :value="form.body" class="prose-nb" />
            </div>
          </div>
        </UFormField>
        <div class="flex flex-wrap items-center gap-3">
          <UButton type="submit" size="lg" :label="t('admin.save')" :loading="busy" />
          <UButton v-if="editing" size="lg" color="neutral" variant="ghost" :label="t('admin.cancel')" @click="reset" />
          <UButton v-if="editing" size="lg" color="neutral" variant="ghost" icon="i-lucide-trash-2" :label="t('admin.delete')" @click="removeCurrent" />
        </div>
      </UForm>

      <p v-if="notice" class="stdout" role="status">
        <UIcon name="i-lucide-check" class="ok size-4 align-[-0.15em]" /> {{ notice }}
      </p>
      <p v-if="error" class="stderr" role="alert">{{ error }}</p>
    </NbCell>
  </div>
</template>
