<script setup lang="ts">
defineProps<{
  posts: { title: string, description?: string, date: string | Date, author: string, minutes: number, path: string, visibility?: string }[]
  lead?: boolean
}>()

const { t, locale } = useI18n()
</script>

<template>
  <div class="df">
    <table>
      <thead>
        <tr>
          <th scope="col"><span class="sr-only">#</span></th>
          <th scope="col">{{ t('df.title') }}</th>
          <th scope="col" class="col-date num">{{ t('df.date') }}</th>
          <th scope="col" class="col-read num">{{ t('df.read') }}</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(post, i) in posts" :key="post.path" :class="{ lead: lead && i === 0 }" :style="{ '--i': i }">
          <th scope="row" class="stream">{{ i }}</th>
          <td class="stream">
            <NuxtLink :to="post.path" class="t">{{ post.title }}</NuxtLink>
            <template v-if="post.visibility && post.visibility !== 'public'">
              <UIcon name="i-lucide-lock" class="ms-1.5 size-3.5 align-[-0.1em] text-[var(--muted)]" aria-hidden="true" />
              <span class="sr-only">{{ t(`visibility.${post.visibility}`) }}</span>
            </template>
            <p v-if="lead && i === 0 && post.description" class="d">{{ post.description }}</p>
            <p class="d mono text-[0.8125rem]">
              {{ post.author }}<span class="md:hidden"> · {{ formatDate(post.date, locale) }} · {{ t('post.minRead', { n: post.minutes }) }}</span>
            </p>
          </td>
          <td class="col-date num stream">{{ formatDate(post.date, locale) }}</td>
          <td class="col-read num stream">{{ t('post.minRead', { n: post.minutes }) }}</td>
        </tr>
      </tbody>
    </table>
    <p class="shape">{{ t('df.rows', posts.length) }}</p>
  </div>
</template>
