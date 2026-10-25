<script setup lang="ts">
definePageMeta({
  key: route => route.fullPath,
  validate: route => route.params.section === 'news' || route.params.section === 'articles'
})

const route = useRoute()
const { locale, t } = useI18n()
const section = route.params.section as 'news' | 'articles'

const { data: post } = await useAsyncData(route.path, () => queryCollection(section).path(route.path).first())
if (!post.value) {
  throw createError({ statusCode: 404, statusMessage: 'Page not found', fatal: true })
}

useSeoMeta({ title: post.value.title, description: post.value.description })
</script>

<template>
  <div v-if="post" class="notebook">
    <NbCell>
      <NuxtLink :to="`/${section}`" class="link">{{ t('post.backTo', { section: t(`sections.${section}`).toLowerCase() }) }}</NuxtLink>
      <div class="md mt-5"><h1>{{ post.title }}</h1></div>
      <p class="md-meta">
        <span>{{ t(`post.${section}`) }}</span>
        <time :datetime="new Date(post.date).toISOString()">{{ formatDate(post.date, locale) }}</time>
        <span>{{ t('post.minRead', { n: post.minutes }) }}</span>
        <span>{{ post.author }}</span>
      </p>
    </NbCell>
    <NbCell>
      <ContentRenderer :value="post" class="prose-nb" />
    </NbCell>
  </div>
</template>
