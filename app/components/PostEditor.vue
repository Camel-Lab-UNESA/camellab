<script setup lang="ts">
import type { Editor, JSONContent } from '@tiptap/vue-3'
import { VISIBILITIES } from '~~/shared/utils/visibility'
import type { Visibility } from '~~/shared/utils/visibility'

type Section = 'news' | 'articles'

export type PostDraft = {
  title: string
  slug: string
  description: string
  date: string
  author: string
  visibility: Visibility
  body: string
}

const props = defineProps<{
  section: Section
  post: PostDraft
  sha?: string
}>()

const emit = defineEmits<{
  saved: [result: { slug: string, sha: string }]
  cancel: []
}>()

const { t } = useI18n()
const form = reactive<PostDraft>({ ...props.post })
const sha = ref(props.sha)
const busy = ref(false)
const uploading = ref(false)
const error = ref('')
const notice = ref('')
const dirty = ref(false)
const isNew = computed(() => !sha.value)
const saveLabel = computed(() => isNew.value ? t('admin.save') : t('admin.update'))
const visibilityItems = computed(() => VISIBILITIES.map(value => ({ label: t(`visibility.${value}`), value })))

const status = computed(() => {
  if (dirty.value) return t('admin.unsavedChanges')
  return sha.value ? t('admin.statusSaved') : ''
})

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

const snapshot = () => JSON.stringify(form)
let baseline = ''
watch(form, () => { dirty.value = snapshot() !== baseline }, { deep: true })
onMounted(async () => {
  await nextTick()
  baseline = snapshot()
  dirty.value = false
})

onBeforeRouteLeave(() => !dirty.value || confirm(t('admin.unsaved')))
function onBeforeUnload(event: BeforeUnloadEvent) {
  if (!dirty.value) return
  event.preventDefault()
  event.returnValue = ''
}
onMounted(() => window.addEventListener('beforeunload', onBeforeUnload))
onBeforeUnmount(() => window.removeEventListener('beforeunload', onBeforeUnload))

function insert(node: JSONContent) {
  editorRef.value?.editor?.chain().focus().insertContent(node).run()
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
    insert({ type: 'image', attrs: { src: url, alt } })
  } catch (e) {
    error.value = messageOf(e, t('errors.generic'))
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
  insert({ type: 'paragraph', content: [{ type: 'text', text: url, marks: [{ type: 'link', attrs: { href: url } }] }] })
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
    const result = await $fetch<{ contentSha: string, slug: string }>(`/api/admin/posts/${props.section}/${slug}`, {
      method: 'PUT',
      body: { ...form, slug, sha: sha.value }
    })
    form.slug = result.slug
    sha.value = result.contentSha
    notice.value = t('admin.saved')
    emit('saved', { slug: result.slug, sha: result.contentSha })
    await nextTick()
    baseline = snapshot()
    dirty.value = false
  } catch (e) {
    error.value = messageOf(e, t('errors.generic'))
  } finally {
    busy.value = false
  }
}

function cancel() {
  if (dirty.value && !confirm(t('admin.unsaved'))) return
  emit('cancel')
}
</script>

<template>
  <UForm :state="form" class="min-w-0" @submit="save">
    <div class="editor-bar">
      <button type="button" class="editor-back" @click="cancel">
        <UIcon name="i-lucide-arrow-left" class="size-4" aria-hidden="true" /> {{ t('admin.cancel') }}
      </button>
      <span class="mono text-xs text-[var(--muted)]">{{ t(`sections.${section}`) }}</span>
      <span class="editor-status">{{ status }}</span>
      <span class="ms-auto">
        <UButton type="submit" class="rounded-full" :label="saveLabel" :loading="busy" :disabled="!isNew && !dirty" />
      </span>
    </div>

    <UTextarea
      v-model="form.title"
      variant="none"
      class="w-full"
      :ui="{ base: 'p-0 text-[1.75rem] sm:text-4xl font-extrabold tracking-tight leading-[1.15] text-[var(--ink)] placeholder:text-[var(--rule)] placeholder:font-normal' }"
      :rows="1"
      autoresize
      :autofocus="isNew"
      :placeholder="t('admin.titlePlaceholder')"
      :aria-label="t('admin.titleField')"
      maxlength="200"
    />
    <UTextarea
      v-model="form.description"
      variant="none"
      class="mt-2 w-full"
      :ui="{ base: 'p-0 text-lg sm:text-xl italic leading-snug text-[var(--muted)] placeholder:text-[var(--rule)] placeholder:not-italic' }"
      :rows="1"
      autoresize
      :placeholder="t('admin.descriptionPlaceholder')"
      :aria-label="t('admin.description')"
      maxlength="300"
    />

    <details class="mt-6 border-y border-[var(--mist)] py-3">
      <summary class="cursor-pointer font-mono text-sm text-[var(--muted)]">{{ t('admin.details') }}</summary>
      <div class="mt-4 grid gap-x-5 gap-y-4 sm:grid-cols-2 lg:grid-cols-4">
        <UFormField :label="t('admin.date')" required>
          <UInput v-model="form.date" type="date" size="sm" class="w-full" />
        </UFormField>
        <UFormField :label="t('admin.author')" required>
          <UInput v-model="form.author" size="sm" class="w-full" maxlength="100" />
        </UFormField>
        <UFormField :label="t('admin.visibility')" required>
          <USelect v-model="form.visibility" :items="visibilityItems" size="sm" class="w-full" />
        </UFormField>
        <UFormField :label="t('admin.slug')" :hint="t('admin.slugHint')">
          <UInput v-model="form.slug" size="sm" class="w-full" maxlength="80" :disabled="!isNew" />
        </UFormField>
      </div>
    </details>

    <div class="mt-8">
      <div class="mb-2 flex flex-wrap gap-1">
        <UButton icon="i-lucide-image-plus" :label="t('admin.editor.image')" color="neutral" variant="ghost" size="xs" :loading="uploading" @click="fileInput?.click()" />
        <UButton icon="i-lucide-youtube" :label="t('admin.editor.video')" color="neutral" variant="ghost" size="xs" @click="addVideo" />
        <input ref="fileInput" type="file" accept="image/png,image/jpeg,image/gif,image/webp" class="hidden" @change="uploadImage">
      </div>
      <UEditor
        ref="editorRef"
        v-slot="{ editor }"
        v-model="form.body"
        content-type="markdown"
        class="prose-nb min-w-0"
        :ui="{ base: 'min-h-[50vh] px-0 sm:px-0' }"
        :placeholder="t('admin.bodyPlaceholder')"
        :aria-label="t('admin.body')"
      >
        <UEditorToolbar :editor="editor" :items="editorItems" class="flex flex-wrap items-center gap-1 border-b border-[var(--mist)] py-1" />
      </UEditor>
    </div>

    <p v-if="error" class="stderr mt-6" role="alert">{{ error }}</p>
    <p v-else-if="notice" class="stdout mt-6" role="status">
      <UIcon name="i-lucide-check" class="ok size-4 align-[-0.15em]" /> {{ notice }}
    </p>
  </UForm>
</template>
