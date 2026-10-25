<template>
  <div class="flex min-h-dvh flex-col">
    <a href="#main" class="skip">{{ $t('nav.skip') }}</a>
    <NbToolbar />
    <main id="main" class="flex-1">
      <slot />
    </main>
    <NbFooter />
  </div>
</template>
