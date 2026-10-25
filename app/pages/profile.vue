<script setup lang="ts">
definePageMeta({ middleware: 'auth' })

const { t, te } = useI18n()
const authError = useAuthError()
const { data: session } = await authClient.useSession(useFetch)
const user = computed(() => session.value?.user)
const busy = ref(false)
const result = ref<{ kind: 'stdout' | 'stderr', text: string }>()
useSeoMeta({ title: () => t('profile.title') })

const state = reactive({
  name: user.value?.name ?? '',
  username: user.value?.displayUsername ?? user.value?.username ?? '',
  department: user.value?.department ?? '',
  bio: user.value?.bio ?? ''
})

async function save() {
  result.value = undefined
  busy.value = true
  try {
    const { error } = await authClient.updateUser({ ...state })
    result.value = error ? { kind: 'stderr', text: authError(error) } : { kind: 'stdout', text: t('nb.saved') }
  } finally {
    busy.value = false
  }
}

async function signOut() {
  await authClient.signOut()
  await navigateTo('/signin')
}
</script>

<template>
  <div v-if="user" class="notebook">
    <NbCell>
      <div class="flex flex-wrap items-center gap-5">
        <UAvatar :src="user.image ?? undefined" :alt="user.name" size="3xl" :ui="{ root: 'bg-[var(--ultra)]', fallback: 'text-white font-bold' }" />
        <div class="md min-w-0 flex-1 basis-64">
          <h1 class="[overflow-wrap:anywhere]">{{ user.name }}</h1>
          <p class="md-meta">
            <span class="[overflow-wrap:anywhere]">@{{ user.displayUsername ?? user.username }}</span>
            <span class="[overflow-wrap:anywhere]">{{ user.email }}</span>
            <span class="font-sans text-[var(--ultra)]">{{ te(`profile.roles.${user.role}`) ? t(`profile.roles.${user.role}`) : user.role }}</span>
          </p>
        </div>
      </div>
    </NbCell>
    <NbCell code="profile.update()" :busy="busy" :error="result?.kind === 'stderr'">
      <UForm :state="state" class="widget-wide space-y-5" @submit="save">
        <UFormField :label="t('profile.name')" name="name" required>
          <UInput v-model="state.name" size="lg" class="w-full" autocomplete="name" :maxlength="100" />
        </UFormField>
        <UFormField :label="t('profile.username')" name="username" required>
          <UInput v-model="state.username" size="lg" class="w-full" autocomplete="username" :maxlength="30" />
        </UFormField>
        <UFormField :label="t('profile.department')" name="department">
          <UInput v-model="state.department" size="lg" class="w-full" :maxlength="100" />
        </UFormField>
        <UFormField :label="t('profile.bio')" name="bio" :hint="`${state.bio.length}/500`">
          <UTextarea v-model="state.bio" size="lg" class="w-full" :maxlength="500" :rows="4" autoresize />
        </UFormField>
        <p v-if="result" :class="result.kind" role="status">
          <UIcon v-if="result.kind === 'stdout'" name="i-lucide-check" class="ok size-4 align-[-0.15em]" /> {{ result.text }}
        </p>
        <div class="flex items-center justify-between gap-4 pt-1">
          <UButton type="submit" size="lg" :label="t('profile.save')" :loading="busy" />
          <UButton size="lg" :label="t('profile.signOut')" color="neutral" variant="ghost" icon="i-lucide-log-out" @click="signOut" />
        </div>
      </UForm>
    </NbCell>
  </div>
</template>
