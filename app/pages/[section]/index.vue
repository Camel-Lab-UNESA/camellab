<script setup lang="ts">
definePageMeta({
  key: route => route.fullPath,
  validate: route => route.params.section === 'news' || route.params.section === 'articles'
})

const route = useRoute()
const { t } = useI18n()
const section = route.params.section as 'news' | 'articles'

const { data: posts } = await useAsyncData(`${section}-list`, () =>
  queryCollection(section).order('date', 'DESC').select('title', 'description', 'date', 'author', 'minutes', 'path').all()
)

const search = ref('')
// shortcut: filters the whole list in the browser, move to a Content query when pagination lands.
const filtered = computed(() => {
  const q = search.value.trim().toLowerCase()
  if (!q) return posts.value ?? []
  return (posts.value ?? []).filter(post =>
    [post.title, post.description, post.author].some(value => value?.toLowerCase().includes(q))
  )
})

useSeoMeta({ title: () => t(`sections.${section}`) })
</script>

<template>
  <div class="notebook">
    <NbCell>
      <div class="md"><h1>{{ t(`sections.${section}`) }}</h1></div>
    </NbCell>
    <NbCell :code="`${section}.all()`">
      <div v-if="posts?.length" class="mb-5 max-w-md">
        <UInput
          v-model="search"
          type="search"
          icon="i-lucide-search"
          size="lg"
          class="w-full"
          :placeholder="t('list.search')"
          :aria-label="t('list.search')"
        />
      </div>
      <NbTable v-if="filtered.length" :posts="filtered" lead />
      <p v-else-if="posts?.length" class="stdout">{{ t('list.noResults', { q: search.trim() }) }}</p>
      <p v-else class="stdout">{{ t(section === 'news' ? 'home.noNews' : 'home.noArticles') }}</p>
      <p v-if="search.trim()" class="sr-only" role="status">{{ t('list.results', filtered.length) }}</p>
    </NbCell>
  </div>
</template>
