<script setup lang="ts">
definePageMeta({
  layout: 'admin',
  middleware: 'auth'
})

const { user, fetch: fetchUserSession } = useUserSession()

await fetchUserSession()

const isAdmin = computed(() => user.value?.role === 'admin')

if (!isAdmin.value) {
  throw createError({
    statusCode: 403,
    statusMessage: 'Admin access only.'
  })
}
</script>

<template>
  <main class="min-h-screen bg-neutral-100 px-6 py-10">
    <div class="mx-auto max-w-6xl space-y-6">
      <div class="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
        <h1 class="text-2xl font-semibold text-neutral-900">Admin Dashboard</h1>
        <p class="mt-2 text-sm text-neutral-600">
          Manage user accounts, property records, and site administration tools.
        </p>
      </div>

      <section class="space-y-4">
        <div class="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
          <h2 class="text-xl font-semibold text-neutral-900">User Management</h2>
          <p class="mt-2 text-sm text-neutral-600">
            Create, review, and manage user accounts and permissions.
          </p>
        </div>

        <div class="grid gap-4 md:grid-cols-3">
          <NuxtLink to="/admin/users" class="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm transition hover:border-neutral-400 hover:shadow">
            <h3 class="text-lg font-semibold text-neutral-900">User List</h3>
            <p class="mt-2 text-sm text-neutral-600">
              View all accounts and manage user access.
            </p>
          </NuxtLink>

          <NuxtLink to="/admin/users/create" class="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm transition hover:border-neutral-400 hover:shadow">
            <h3 class="text-lg font-semibold text-neutral-900">Create Account</h3>
            <p class="mt-2 text-sm text-neutral-600">
              Create a new user or admin account.
            </p>
          </NuxtLink>

          <NuxtLink to="/admin/users" class="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm transition hover:border-neutral-400 hover:shadow">
            <h3 class="text-lg font-semibold text-neutral-900">Edit Accounts</h3>
            <p class="mt-2 text-sm text-neutral-600">
              Update names, emails, roles, passwords, and delete accounts.
            </p>
          </NuxtLink>
        </div>
      </section>

      <section class="space-y-4">
        <div class="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
          <h2 class="text-xl font-semibold text-neutral-900">Property Management</h2>
          <p class="mt-2 text-sm text-neutral-600">
            Create and maintain the documented property records that appear on the public site.
          </p>
        </div>

        <div class="grid gap-4 md:grid-cols-3">
          <NuxtLink to="/admin/properties" class="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm transition hover:border-neutral-400 hover:shadow">
            <h3 class="text-lg font-semibold text-neutral-900">Property List</h3>
            <p class="mt-2 text-sm text-neutral-600">
              View all property records, search them, and access editing tools.
            </p>
          </NuxtLink>

          <NuxtLink to="/admin/properties/create" class="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm transition hover:border-neutral-400 hover:shadow">
            <h3 class="text-lg font-semibold text-neutral-900">Create Property</h3>
            <p class="mt-2 text-sm text-neutral-600">
              Add a new boarded up, damaged, or otherwise documented property.
            </p>
          </NuxtLink>

          <NuxtLink to="/admin/properties" class="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm transition hover:border-neutral-400 hover:shadow">
            <h3 class="text-lg font-semibold text-neutral-900">Edit Properties</h3>
            <p class="mt-2 text-sm text-neutral-600">
              Update property details, issues, images, observations, and status.
            </p>
          </NuxtLink>
        </div>
      </section>
    </div>
  </main>
</template>