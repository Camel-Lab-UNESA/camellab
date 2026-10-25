<script setup lang="ts">
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

useSeoMeta(post.value
  ? { title: post.value.title, description: post.value.description }
  : { title: t('post.signInTitle'), robots: 'noindex' })
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
        <span v-if="post.visibility !== 'public'"><UIcon name="i-lucide-lock" class="size-3.5 align-[-0.1em]" /> {{ t(`visibility.${post.visibility}`) }}</span>
      </p>
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
