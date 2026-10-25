<script setup lang="ts">
import type { AuthFormField, FormError, FormSubmitEvent } from '@nuxt/ui'

type State = { name?: string, username?: string, email?: string, password?: string, role?: 'student' | 'lecturer' }

const { t } = useI18n()
const authError = useAuthError()
const busy = ref(false)
const error = ref('')
const sentTo = ref('')
useSeoMeta({ title: () => t('signup.title') })

const fields = computed<AuthFormField[]>(() => [
  { name: 'name', label: t('signup.name'), required: true, autocomplete: 'name', size: 'lg' },
  { name: 'username', label: t('signup.username'), required: true, autocomplete: 'username', help: t('signup.usernameHelp'), size: 'lg' },
  { name: 'email', label: t('signup.email'), type: 'email', required: true, autocomplete: 'email', size: 'lg' },
  { name: 'password', label: t('signup.password'), type: 'password', required: true, autocomplete: 'new-password', help: t('signup.passwordHelp'), size: 'lg' },
  {
    name: 'role',
    label: t('signup.role'),
    type: 'select',
    items: [{ label: t('signup.student'), value: 'student' }, { label: t('signup.lecturer'), value: 'lecturer' }],
    valueKey: 'value',
    defaultValue: 'student',
    searchInput: false,
    size: 'lg'
  }
])

function validate(state: State) {
  const errors: FormError[] = []
  if (!state.name?.trim()) errors.push({ name: 'name', message: t('form.required') })
  if (!/^[a-zA-Z0-9_.]{3,30}$/.test(state.username ?? '')) errors.push({ name: 'username', message: t('form.username') })
  if (!state.email?.includes('@')) errors.push({ name: 'email', message: t('form.email') })
  if ((state.password?.length ?? 0) < 8) errors.push({ name: 'password', message: t('form.password') })
  return errors
}

async function onSubmit({ data }: FormSubmitEvent<Required<State>>) {
  error.value = ''
  busy.value = true
  try {
    const { data: result, error: e } = await authClient.signUp.email({ ...data, callbackURL: '/profile' })
    if (e) {
      error.value = authError(e)
      return
    }
    // A token means confirmation is off and the user is already signed in.
    if (result?.token) return navigateTo('/profile')
    sentTo.value = data.email
  } finally {
    busy.value = false
  }
}
</script>

<template>
  <div class="notebook">
    <NbCell>
      <div class="md"><h1>{{ sentTo ? t('signup.checkInbox') : t('signup.title') }}</h1></div>
    </NbCell>
    <NbCell code="auth.sign_up()" :busy="busy" :error="!!error">
      <p v-if="sentTo" class="stdout"><UIcon name="i-lucide-check" class="ok size-4 align-[-0.15em]" /> {{ t('signup.sentTo', { email: sentTo }) }}</p>
      <div v-else class="widget">
        <UAuthForm :fields="fields" :validate="validate" :submit="{ label: t('signup.submit'), size: 'lg' }" @submit="onSubmit">
          <template #validation>
            <p v-if="error" class="stderr" role="alert">{{ error }}</p>
          </template>
        </UAuthForm>
        <p class="widget-foot">
          {{ t('signup.haveAccount') }} <NuxtLink to="/signin" class="link">{{ t('signup.signIn') }}</NuxtLink>
        </p>
      </div>
    </NbCell>
  </div>
</template>
