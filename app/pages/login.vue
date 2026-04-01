<script setup lang="ts">
const email = ref('')
const password = ref('')
const isSubmitting = ref(false)
const errorMessage = ref('')

const { fetch: fetchUserSession, loggedIn } = useUserSession()

watchEffect(() => {
  if (loggedIn.value) {
    navigateTo('/admin')
  }
})

const handleLogin = async () => {
  errorMessage.value = ''
  isSubmitting.value = true

  try {
    await $fetch('/api/auth/login', {
      method: 'POST',
      body: {
        email: email.value,
        password: password.value
      }
    })

    await fetchUserSession()
    await navigateTo('/admin')
  } catch (error: any) {
    errorMessage.value =
      error?.data?.statusMessage ||
      error?.data?.message ||
      'Login failed. Please check your credentials.'
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <main class="min-h-screen bg-neutral-100 px-6 py-10">
    <div class="mx-auto max-w-md rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
      <div class="mb-6">
        <h1 class="text-2xl font-semibold text-neutral-900">Admin Login</h1>
        <p class="mt-2 text-sm text-neutral-600">
          Sign in to manage Town Project property records.
        </p>
      </div>

      <form class="space-y-4" @submit.prevent="handleLogin">
        <div>
          <label for="email" class="mb-1 block text-sm font-medium text-neutral-700">
            Email
          </label>
          <input
            id="email"
            v-model="email"
            type="email"
            autocomplete="email"
            class="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm outline-none ring-0 transition focus:border-neutral-900"
            placeholder="admin@townproject.com"
          >
        </div>

        <div>
          <label for="password" class="mb-1 block text-sm font-medium text-neutral-700">
            Password
          </label>
          <input
            id="password"
            v-model="password"
            type="password"
            autocomplete="current-password"
            class="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm outline-none ring-0 transition focus:border-neutral-900"
            placeholder="Enter password"
          >
        </div>

        <p v-if="errorMessage" class="text-sm text-red-600">
          {{ errorMessage }}
        </p>

        <button
          type="submit"
          :disabled="isSubmitting"
          class="inline-flex w-full items-center justify-center rounded-lg bg-neutral-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {{ isSubmitting ? 'Signing in...' : 'Sign In' }}
        </button>
      </form>
    </div>
  </main>
</template>