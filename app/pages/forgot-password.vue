<script setup lang="ts">
import type { AuthFormField, FormError, FormSubmitEvent } from '@nuxt/ui'

type State = { email?: string }

const { t } = useI18n()
const authError = useAuthError()
const busy = ref(false)
const error = ref('')
const sentTo = ref('')
useSeoMeta({ title: () => t('forgot.title') })

const fields = computed<AuthFormField[]>(() => [
  { name: 'email', label: t('forgot.email'), type: 'email', required: true, autocomplete: 'email', size: 'lg' }
])

function validate(state: State) {
  const errors: FormError[] = []
  if (!state.email?.includes('@')) errors.push({ name: 'email', message: t('form.email') })
  return errors
}

async function onSubmit({ data }: FormSubmitEvent<Required<State>>) {
  error.value = ''
  busy.value = true
  try {
    const { error: e } = await authClient.requestPasswordReset({ email: data.email, redirectTo: '/reset-password' })
    if (e) error.value = authError(e)
    else sentTo.value = data.email
  } finally {
    busy.value = false
  }
}
</script>

<template>
  <div class="notebook">
    <NbCell>
      <div class="md"><h1>{{ sentTo ? t('forgot.checkInbox') : t('forgot.title') }}</h1></div>
    </NbCell>
    <NbCell code="auth.reset_password()" :busy="busy" :error="!!error">
      <p v-if="sentTo" class="stdout"><UIcon name="i-lucide-check" class="ok size-4 align-[-0.15em]" /> {{ t('forgot.sent', { email: sentTo }) }}</p>
      <div v-else class="widget">
        <UAuthForm :fields="fields" :validate="validate" :submit="{ label: t('forgot.submit'), size: 'lg' }" @submit="onSubmit">
          <template #validation>
            <p v-if="error" class="stderr" role="alert">{{ error }}</p>
          </template>
        </UAuthForm>
        <p class="widget-foot">
          {{ t('forgot.remembered') }} <NuxtLink to="/signin" class="link">{{ t('forgot.signIn') }}</NuxtLink>
        </p>
      </div>
    </NbCell>
  </div>
</template>
