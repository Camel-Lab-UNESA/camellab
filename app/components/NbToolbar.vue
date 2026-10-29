<script setup lang="ts">
const { t } = useI18n()
const kernel = useKernel()
const { data: session } = await useAuthSession()
</script>

<template>
  <header class="toolbar">
    <NuxtLink to="/" class="toolbar-brand" :aria-label="t('nav.home')"><img src="/logo/camellab-mark.svg" alt="" width="36" height="28" class="toolbar-logo">Camellab<span class="mono">.ipynb</span></NuxtLink>
    <span class="kernel" :data-busy="kernel.state.value.busy">
      <span class="kernel-dot" aria-hidden="true" />
      {{ kernel.state.value.busy ? t('nb.running') : t('nb.idle') }}
    </span>
    <UButton class="hidden md:inline-flex" icon="i-lucide-list-video" :label="t('nb.runAll')" color="neutral" variant="ghost" size="sm" @click="kernel.runAll()" />
    <nav class="toolbar-nav" :aria-label="t('nav.main')">
      <NuxtLink to="/news" class="toolbar-link">{{ t('nav.news') }}</NuxtLink>
      <NuxtLink to="/articles" class="toolbar-link">{{ t('nav.articles') }}</NuxtLink>
    </nav>
    <LangSwitch />
    <UButton v-if="session?.user.role === 'internal'" to="/admin" :label="t('nav.admin')" icon="i-lucide-pen-line" color="neutral" variant="ghost" class="toolbar-account" />
    <UButton v-if="session?.user" to="/profile" :label="t('nav.profile')" icon="i-lucide-user-round" color="neutral" variant="outline" class="toolbar-account" />
    <UButton v-else to="/signin" :label="t('nav.signIn')" class="toolbar-account" />
  </header>
</template>
