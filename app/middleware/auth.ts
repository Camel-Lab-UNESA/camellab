export default defineNuxtRouteMiddleware(async () => {
  const session = await useRequestFetch()('/api/auth/get-session')
  if (!session) return navigateTo('/signin')
})
