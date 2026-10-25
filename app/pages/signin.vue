<script setup lang="ts">
import type { AuthFormField, FormError, FormSubmitEvent } from '@nuxt/ui'

type State = { identifier?: string, password?: string }

const { t } = useI18n()
const authError = useAuthError()
const busy = ref(false)
const notice = ref<{ kind: 'stdout' | 'stderr', text: string }>()
useSeoMeta({ title: () => t('signin.title') })

const fields = computed<AuthFormField[]>(() => [
  { name: 'identifier', label: t('signin.identifier'), required: true, autocomplete: 'username', size: 'lg' },
  { name: 'password', label: t('signin.password'), type: 'password', required: true, autocomplete: 'current-password', size: 'lg' }
])

function validate(state: State) {
  const errors: FormError[] = []
  if (!state.identifier) errors.push({ name: 'identifier', message: t('form.required') })
  if (!state.password) errors.push({ name: 'password', message: t('form.required') })
  return errors
}

async function onSubmit({ data }: FormSubmitEvent<Required<State>>) {
  const { identifier, password } = data
  notice.value = undefined
  busy.value = true
  try {
    const { error } = identifier.includes('@')
      ? await authClient.signIn.email({ email: identifier, password, callbackURL: '/profile' })
      : await authClient.signIn.username({ username: identifier, password, callbackURL: '/profile' })
    if (!error) return navigateTo('/profile')
    notice.value = error.code === 'EMAIL_NOT_VERIFIED'
      ? { kind: 'stdout', text: `${t('signin.confirmFirst')}. ${t('signin.sentNewLink')}` }
      : { kind: 'stderr', text: authError(error) }
  } finally {
    busy.value = false
  }
}
</script>

<template>
  <div class="notebook">
    <NbCell>
      <div class="md"><h1>{{ t('signin.title') }}</h1></div>
    </NbCell>
    <NbCell code="auth.sign_in()" :busy="busy" :error="notice?.kind === 'stderr'">
      <div class="widget">
        <UAuthForm :fields="fields" :validate="validate" :submit="{ label: t('signin.submit'), size: 'lg' }" @submit="onSubmit">
          <template #password-hint>
            <NuxtLink to="/forgot-password" class="link">{{ t('signin.forgot') }}</NuxtLink>
          </template>
          <template #validation>
            <p v-if="notice" :class="notice.kind" role="alert">{{ notice.text }}</p>
          </template>
        </UAuthForm>
        <p class="widget-foot">
          {{ t('signin.noAccount') }} <NuxtLink to="/signup" class="link">{{ t('signin.signUp') }}</NuxtLink>
        </p>
      </div>
    </NbCell>
  </div>
</template>
