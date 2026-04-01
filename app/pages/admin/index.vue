<script setup lang="ts">
definePageMeta({
  middleware: 'auth'
})

const { user, clear, fetch: fetchUserSession } = useUserSession()

await fetchUserSession()

const handleLogout = async () => {
  await $fetch('/api/auth/logout', {
    method: 'POST'
  })

  await clear()
  await navigateTo('/login')
}
</script>

<template>
  <main class="min-h-screen bg-neutral-100 px-6 py-10">
    <div class="mx-auto max-w-4xl rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
      <div class="flex items-start justify-between gap-4">
        <div>
          <h1 class="text-2xl font-semibold text-neutral-900">Admin Dashboard</h1>
          <p class="mt-2 text-sm text-neutral-600">
            Signed in as {{ user?.name }} ({{ user?.email }})
          </p>
        </div>

        <button
          type="button"
          class="rounded-lg border border-neutral-300 px-4 py-2 text-sm font-medium text-neutral-800 transition hover:bg-neutral-50"
          @click="handleLogout"
        >
          Logout
        </button>
      </div>

      <div class="mt-8 rounded-xl border border-neutral-200 bg-neutral-50 p-4">
        <p class="text-sm text-neutral-700">
          Auth is working. Next step is connecting this to PostgreSQL and replacing the hard-coded admin credentials.
        </p>
      </div>
    </div>
  </main>
</template>