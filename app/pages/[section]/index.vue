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

useSeoMeta({ title: () => t(`sections.${section}`) })
</script>

<template>
  <div class="notebook">
    <NbCell>
      <div class="md"><h1>{{ t(`sections.${section}`) }}</h1></div>
    </NbCell>
    <NbCell :code="`${section}.all()`">
      <NbTable v-if="posts?.length" :posts="posts" lead />
      <p v-else class="stdout">{{ t(section === 'news' ? 'home.noNews' : 'home.noArticles') }}</p>
    </NbCell>
  </div>
</template>
