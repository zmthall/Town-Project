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

const { data, refresh, pending, error } = await useFetch<{ success: boolean; users: AdminUserRecord[] }>('/api/users', {
  method: 'GET'
})

const users = computed(() => data.value?.users ?? [])
</script>

<template>
  <main class="min-h-screen bg-neutral-100 px-6 py-10">
    <div class="mx-auto max-w-6xl space-y-6">
      <div class="flex items-center justify-between gap-4 rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
        <div>
          <h1 class="text-2xl font-semibold text-neutral-900">User Management</h1>
          <p class="mt-2 text-sm text-neutral-600">
            View all accounts, edit users, and create new ones.
          </p>
        </div>

        <NuxtLink to="/admin/users/create" class="inline-flex items-center justify-center rounded-lg bg-neutral-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-neutral-800">
          Create User
        </NuxtLink>
      </div>

      <div class="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
        <div v-if="pending" class="text-sm text-neutral-600">
          Loading users...
        </div>

        <div v-else-if="error" class="space-y-3">
          <p class="text-sm text-red-600">
            Failed to load users.
          </p>

          <button type="button" class="rounded-lg border border-neutral-300 px-4 py-2 text-sm font-medium text-neutral-800 transition hover:bg-neutral-50" @click="refresh()">
            Retry
          </button>
        </div>

        <div v-else class="overflow-x-auto">
          <table class="min-w-full border-collapse">
            <thead>
              <tr class="border-b border-neutral-200 text-left text-sm text-neutral-600">
                <th class="px-3 py-3 font-medium">ID</th>
                <th class="px-3 py-3 font-medium">Name</th>
                <th class="px-3 py-3 font-medium">Email</th>
                <th class="px-3 py-3 font-medium">Role</th>
                <th class="px-3 py-3 font-medium">Active</th>
                <th class="px-3 py-3 font-medium">Actions</th>
              </tr>
            </thead>

            <tbody>
              <tr v-for="account in users" :key="account.id" class="border-b border-neutral-100 text-sm text-neutral-800">
                <td class="px-3 py-3">{{ account.id }}</td>
                <td class="px-3 py-3">{{ account.name }}</td>
                <td class="px-3 py-3">{{ account.email }}</td>
                <td class="px-3 py-3">{{ account.role }}</td>
                <td class="px-3 py-3">{{ account.is_active ? 'Yes' : 'No' }}</td>
                <td class="px-3 py-3">
                  <NuxtLink :to="`/admin/users/${account.id}`" class="text-sm font-medium text-neutral-900 underline underline-offset-2">
                    Edit
                  </NuxtLink>
                </td>
              </tr>

              <tr v-if="users.length === 0">
                <td colspan="6" class="px-3 py-6 text-center text-sm text-neutral-500">
                  No users found.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </main>
</template>