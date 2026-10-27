<script setup lang="ts">
const { locale, t } = useI18n()
const { data: session } = await authClient.useSession(useFetch)

// Posts come through /api/posts, which only returns what the viewer's role may read.
const requestFetch = useRequestFetch()
const { data } = await useAsyncData('home', async () => {
  const [about, news, articles] = await Promise.all([
    queryCollection('about').path(`/about/${locale.value}`).first(),
    requestFetch('/api/posts', { query: { section: 'news' } }),
    requestFetch('/api/posts', { query: { section: 'articles' } })
  ])
  return {
    about,
    news: news.slice(0, 4),
    articles: articles.slice(0, 4),
    newsCount: news.length,
    articlesCount: articles.length
  }
}, { watch: [locale] })

useSeoMeta({
  title: () => t('home.title'),
  description: () => data.value?.about?.tagline
})
</script>

<template>
  <div class="notebook">
    <CamelWander />
    <NbCell code="camellab.about()" typed hero>
      <div class="hero-out">
        <h1 class="hero-title stream">Camellab</h1>
        <div class="hero-grid">
          <div class="hero-left">
            <ul class="stdout hero-log">
              <li class="stream" style="--i: 1">{{ t('home.logNews', data?.newsCount ?? 0) }}</li>
              <li class="stream" style="--i: 2">{{ t('home.logArticles', data?.articlesCount ?? 0) }}</li>
              <li class="stream" style="--i: 3">{{ t('home.logLanguages') }}</li>
            </ul>
            <div>
              <p class="hero-line stream" style="--i: 4">{{ data?.about?.tagline }}</p>
              <UButton
                to="#about"
                size="xl"
                :label="t('home.aboutAction')"
                trailing-icon="i-lucide-arrow-down"
                class="stream mt-6"
                style="--i: 5"
              />
            </div>
          </div>
          <NbPlot class="stream self-end" style="--i: 2" />
        </div>
      </div>
    </NbCell>

    <NbCell id="about" class="scroll-mt-20">
      <div class="md"><h2>{{ t('home.about') }}</h2></div>
      <ContentRenderer v-if="data?.about" :value="data.about" class="prose-nb mt-4" />
    </NbCell>

    <NbCell id="news" class="scroll-mt-20">
      <div class="md"><h2>{{ t('home.latestNews') }}</h2></div>
    </NbCell>
    <NbCell code="news.latest(4)">
      <NbTable v-if="data?.news.length" :posts="data.news" lead />
      <p v-else class="stdout">{{ t('home.noNews') }}</p>
      <NuxtLink to="/news" class="link mt-4 inline-block">{{ t('home.allNews') }}</NuxtLink>
    </NbCell>

    <NbCell>
      <div class="md"><h2>{{ t('home.articles') }}</h2></div>
    </NbCell>
    <NbCell code="articles.latest(4)">
      <NbTable v-if="data?.articles.length" :posts="data.articles" />
      <p v-else class="stdout">{{ t('home.noArticles') }}</p>
      <NuxtLink to="/articles" class="link mt-4 inline-block">{{ t('home.allArticles') }}</NuxtLink>
    </NbCell>

    <NbCell>
      <div class="md"><h2>{{ session?.user ? t('home.account') : t('home.join') }}</h2></div>
    </NbCell>
    <NbCell :code="session?.user ? 'lab.me()' : 'lab.join()'">
      <template v-if="session?.user">
        <p class="stdout stream">{{ t('home.signedInAs', { name: session.user.name }) }}</p>
        <UButton to="/profile" size="lg" :label="t('home.openProfile')" class="stream mt-4" style="--i: 1" />
      </template>
      <template v-else>
        <p class="stdout stream">{{ t('home.joinText') }}</p>
        <div class="stream mt-4 flex flex-wrap items-center gap-x-5 gap-y-3" style="--i: 1">
          <UButton to="/signup" size="lg" :label="t('home.joinAction')" />
          <NuxtLink to="/signin" class="link">{{ t('home.joinSignIn') }}</NuxtLink>
        </div>
      </template>
    </NbCell>
  </div>
</template>
