// Better Auth returns English messages; show ours when we have one for the error code.
export function useAuthError() {
  const { t, te } = useI18n()
  return (error: { code?: string, message?: string }) =>
    error.code && te(`errors.${error.code}`) ? t(`errors.${error.code}`) : (error.message || t('errors.generic'))
}
