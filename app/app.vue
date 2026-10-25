<script setup lang="ts">
import * as uiLocales from '@nuxt/ui/locale'

const { locale } = useI18n()
useHead({
  htmlAttrs: { lang: locale },
  // Mark JS before first paint so cells can start collapsed without a flash; without JS every output stays visible.
  script: [{ innerHTML: 'document.documentElement.classList.add(\'nb-js\')', tagPosition: 'head' }]
})
</script>

<template>
  <UApp :locale="uiLocales[locale]">
    <NuxtRouteAnnouncer />
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </UApp>
</template>
