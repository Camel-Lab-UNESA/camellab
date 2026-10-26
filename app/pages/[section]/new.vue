<script setup lang="ts">
import type { PostDraft } from '~~/app/components/PostEditor.vue'

definePageMeta({
  middleware: 'internal',
  validate: route => route.params.section === 'news' || route.params.section === 'articles'
})

const route = useRoute()
const { t } = useI18n()
const section = route.params.section as 'news' | 'articles'

const { data: session } = await authClient.useSession(useFetch)
const draft: PostDraft = {
  title: '',
  slug: '',
  description: '',
  date: new Date().toISOString().slice(0, 10),
  author: session.value?.user.name ?? '',
  visibility: 'public',
  body: ''
}

useSeoMeta({ title: t('admin.new'), robots: 'noindex' })

async function saved(result: { slug: string }) {
  await navigateTo(`/${section}/${result.slug}?edit=1`, { replace: true })
}
</script>

<template>
  <div class="notebook">
    <div class="widget-wide">
      <PostEditor :section="section" :post="draft" @cancel="navigateTo(`/${section}`)" @saved="saved" />
    </div>
  </div>
</template>
