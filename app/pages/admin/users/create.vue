<script setup lang="ts">
definePageMeta({
  layout: 'admin',
  middleware: 'auth'
})

const { user, fetch: fetchUserSession } = useUserSession()

await fetchUserSession()

if (user.value?.role !== 'admin') {
  throw createError({
    statusCode: 403,
    statusMessage: 'Admin access only.'
  })
}

const form = reactive({
  name: '',
  email: '',
  password: '',
  role: 'user' as 'admin' | 'user',
  isActive: true
})

const isSubmitting = ref(false)
const errorMessage = ref('')
const successMessage = ref('')

const handleCreateUser = async () => {
  errorMessage.value = ''
  successMessage.value = ''
  isSubmitting.value = true

  try {
    await $fetch('/api/users/create', {
      method: 'POST',
      body: {
        name: form.name,
        email: form.email,
        password: form.password,
        role: form.role,
        isActive: form.isActive
      }
    })

    successMessage.value = 'User account created successfully.'

    form.name = ''
    form.email = ''
    form.password = ''
    form.role = 'user'
    form.isActive = true
  } catch (error: any) {
    errorMessage.value =
      error?.data?.statusMessage ||
      error?.data?.message ||
      'Failed to create user.'
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <main class="min-h-screen bg-neutral-100 px-6 py-10">
    <div class="mx-auto max-w-2xl rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
      <div class="mb-6">
        <h1 class="text-2xl font-semibold text-neutral-900">Create User Account</h1>
        <p class="mt-2 text-sm text-neutral-600">
          Create a new account and assign its role.
        </p>
      </div>

      <form class="space-y-4" @submit.prevent="handleCreateUser">
        <div>
          <label for="name" class="mb-1 block text-sm font-medium text-neutral-700">Name</label>
          <input id="name" v-model="form.name" type="text" class="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm outline-none transition focus:border-neutral-900" />
        </div>

        <div>
          <label for="email" class="mb-1 block text-sm font-medium text-neutral-700">Email</label>
          <input id="email" v-model="form.email" type="email" class="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm outline-none transition focus:border-neutral-900" />
        </div>

        <div>
          <label for="password" class="mb-1 block text-sm font-medium text-neutral-700">Password</label>
          <input id="password" v-model="form.password" type="password" class="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm outline-none transition focus:border-neutral-900" />
        </div>

        <div>
          <label for="role" class="mb-1 block text-sm font-medium text-neutral-700">Role</label>
          <select id="role" v-model="form.role" class="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm outline-none transition focus:border-neutral-900">
            <option value="user">User</option>
            <option value="admin">Admin</option>
          </select>
        </div>

        <label class="flex items-center gap-2 text-sm text-neutral-700">
          <input v-model="form.isActive" type="checkbox" />
          Active account
        </label>

        <p v-if="errorMessage" class="text-sm text-red-600">
          {{ errorMessage }}
        </p>

        <p v-if="successMessage" class="text-sm text-green-600">
          {{ successMessage }}
        </p>

        <div class="flex items-center gap-3">
          <button type="submit" :disabled="isSubmitting" class="inline-flex items-center justify-center rounded-lg bg-neutral-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-60">
            {{ isSubmitting ? 'Creating...' : 'Create User' }}
          </button>

          <NuxtLink to="/admin/users" class="inline-flex items-center justify-center rounded-lg border border-neutral-300 px-4 py-2 text-sm font-medium text-neutral-800 transition hover:bg-neutral-50">
            Back to Users
          </NuxtLink>
        </div>
      </form>
    </div>
  </main>
</template>