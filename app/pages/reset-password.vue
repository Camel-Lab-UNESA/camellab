<script setup lang="ts">
import type { AuthFormField, FormError, FormSubmitEvent } from '@nuxt/ui'

type State = { password?: string, confirm?: string }

const route = useRoute()
const { t } = useI18n()
const toast = useToast()
const authError = useAuthError()
const busy = ref(false)
const error = ref('')
useSeoMeta({ title: () => t('reset.title') })

// Better Auth redirects here with ?token=… for a valid link, or ?error=INVALID_TOKEN otherwise.
const token = computed(() => typeof route.query.token === 'string' ? route.query.token : '')

const fields = computed<AuthFormField[]>(() => [
  { name: 'password', label: t('reset.password'), type: 'password', required: true, autocomplete: 'new-password', help: t('reset.passwordHelp'), size: 'lg' },
  { name: 'confirm', label: t('reset.confirm'), type: 'password', required: true, autocomplete: 'new-password', size: 'lg' }
])

function validate(state: State) {
  const errors: FormError[] = []
  if ((state.password?.length ?? 0) < 8) errors.push({ name: 'password', message: t('form.password') })
  if (state.confirm !== state.password) errors.push({ name: 'confirm', message: t('reset.mismatch') })
  return errors
}

async function onSubmit({ data }: FormSubmitEvent<Required<State>>) {
  error.value = ''
  busy.value = true
  try {
    const { error: e } = await authClient.resetPassword({ newPassword: data.password, token: token.value })
    if (e) {
      error.value = authError(e)
      return
    }
    toast.add({ title: t('reset.updated'), description: t('reset.signInNew'), color: 'success' })
    await navigateTo('/signin')
  } finally {
    busy.value = false
  }
}
</script>

<template>
  <div class="notebook">
    <NbCell>
      <div class="md"><h1>{{ token ? t('reset.title') : t('reset.invalidTitle') }}</h1></div>
    </NbCell>
    <NbCell code="auth.set_password()" :busy="busy" :error="!!error">
      <template v-if="!token">
        <p class="stderr">{{ t('reset.invalidText') }}</p>
        <UButton to="/forgot-password" size="lg" :label="t('reset.requestNew')" class="mt-4" />
      </template>
      <div v-else class="widget">
        <UAuthForm :fields="fields" :validate="validate" :submit="{ label: t('reset.submit'), size: 'lg' }" @submit="onSubmit">
          <template #validation>
            <p v-if="error" class="stderr" role="alert">{{ error }}</p>
          </template>
        </UAuthForm>
      </div>
    </NbCell>
  </div>
</template>
