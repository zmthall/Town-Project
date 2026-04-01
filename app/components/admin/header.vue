<script setup lang="ts">
const { user, clear, fetch: fetchUserSession } = useUserSession()

const isSubmittingLogout = ref(false)

await fetchUserSession()

const handleLogout = async () => {
  if (isSubmittingLogout.value) {
    return
  }

  isSubmittingLogout.value = true

  try {
    await $fetch('/api/auth/logout', {
      method: 'POST'
    })

    await clear()
    await navigateTo('/login')
  } finally {
    isSubmittingLogout.value = false
  }
}
</script>

<template>
  <header class="sticky top-0 z-50 border-b border-neutral-200 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80">
    <div class="mx-auto flex max-w-7xl items-center justify-between gap-4 px-6 py-4">
      <div class="flex min-w-0 flex-col">
        <NuxtLink to="/admin" class="text-lg font-semibold text-neutral-900">
          Town Project Admin
        </NuxtLink>

        <p class="truncate text-sm text-neutral-600">
          Signed in as {{ user?.name }}<span v-if="user?.email"> ({{ user.email }})</span>
        </p>
      </div>

      <div class="flex items-center gap-3">
        <NuxtLink to="/admin" class="rounded-lg px-3 py-2 text-sm font-medium text-neutral-700 transition hover:bg-neutral-100 hover:text-neutral-900">
          Dashboard
        </NuxtLink>

        <NuxtLink to="/admin/users" class="rounded-lg px-3 py-2 text-sm font-medium text-neutral-700 transition hover:bg-neutral-100 hover:text-neutral-900">
          Users
        </NuxtLink>

        <NuxtLink to="/admin/users/create" class="rounded-lg px-3 py-2 text-sm font-medium text-neutral-700 transition hover:bg-neutral-100 hover:text-neutral-900">
          Create User
        </NuxtLink>

        <button type="button" :disabled="isSubmittingLogout" class="inline-flex items-center justify-center rounded-lg bg-neutral-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-60" @click="handleLogout">
          {{ isSubmittingLogout ? 'Logging out...' : 'Logout' }}
        </button>
      </div>
    </div>
  </header>
</template>