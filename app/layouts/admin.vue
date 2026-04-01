<script setup lang="ts">
const { user, fetch: fetchUserSession } = useUserSession()

await fetchUserSession()

if (!user.value) {
  await navigateTo('/login')
}

if (user.value?.role !== 'admin') {
  throw createError({
    statusCode: 403,
    statusMessage: 'Admin access only.'
  })
}
</script>

<template>
  <div class="min-h-screen bg-neutral-100">
    <AdminHeader />

    <div class="mx-auto max-w-7xl px-6 py-8">
      <slot />
    </div>
  </div>
</template>