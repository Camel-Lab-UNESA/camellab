<template>
  <footer class="site-foot">
    <p>{{ $t('footer.tagline') }}</p>
    <nav :aria-label="$t('nav.footer')">
      <NuxtLink to="/news">{{ $t('nav.news') }}</NuxtLink>
      <NuxtLink to="/articles">{{ $t('nav.articles') }}</NuxtLink>
    </nav>
  </footer>
</template>
