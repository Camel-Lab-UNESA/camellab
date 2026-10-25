<script setup lang="ts">
const { locale, locales, setLocale, t } = useI18n()
</script>

<template>
  <div class="lang" role="group" :aria-label="t('nav.language')">
    <button
      v-for="l in locales"
      :key="l.code"
      type="button"
      :lang="l.language"
      :title="l.name"
      :aria-pressed="locale === l.code"
      @click="setLocale(l.code)"
    >
      {{ l.code.toUpperCase() }}
    </button>
  </div>
</template>
