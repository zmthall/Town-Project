<script setup lang="ts">
definePageMeta({
  layout: 'admin',
  middleware: 'auth'
})

type AdminUserRecord = {
  id: number
  email: string
  name: string
  role: 'admin' | 'user'
  is_active: boolean
  created_at: string
  updated_at: string
}

const route = useRoute()
const { user, fetch: fetchUserSession } = useUserSession()

await fetchUserSession()

if (user.value?.role !== 'admin') {
  throw createError({
    statusCode: 403,
    statusMessage: 'Admin access only.'
  })
}

const targetUserId = Number(route.params.id)

if (Number.isNaN(targetUserId)) {
  throw createError({
    statusCode: 400,
    statusMessage: 'Invalid user ID.'
  })
}

const { data, refresh } = await useFetch<{ success: boolean; user: AdminUserRecord }>(`/api/users/${targetUserId}`, {
  method: 'GET'
})

const targetUser = computed(() => data.value?.user ?? null)

const nameForm = reactive({
  name: ''
})

const emailForm = reactive({
  email: ''
})

const roleForm = reactive({
  role: 'user' as 'admin' | 'user'
})

const passwordForm = reactive({
  newPassword: ''
})

const deleteError = ref('')
const generalMessage = ref('')

watchEffect(() => {
  if (targetUser.value) {
    nameForm.name = targetUser.value.name
    emailForm.email = targetUser.value.email
    roleForm.role = targetUser.value.role
  }
})

const handleUpdateName = async () => {
  generalMessage.value = ''

  await $fetch(`/api/users/${targetUserId}/name`, {
    method: 'PATCH',
    body: {
      name: nameForm.name
    }
  })

  generalMessage.value = 'Name updated successfully.'
  await refresh()
}

const handleUpdateEmail = async () => {
  generalMessage.value = ''

  await $fetch(`/api/users/${targetUserId}/email`, {
    method: 'PATCH',
    body: {
      email: emailForm.email
    }
  })

  generalMessage.value = 'Email updated successfully.'
  await refresh()
}

const handleUpdateRole = async () => {
  generalMessage.value = ''

  await $fetch(`/api/users/${targetUserId}/role`, {
    method: 'PATCH',
    body: {
      role: roleForm.role
    }
  })

  generalMessage.value = 'Role updated successfully.'
  await refresh()
}

const handleChangePassword = async () => {
  generalMessage.value = ''

  await $fetch('/api/users/change-password', {
    method: 'POST',
    body: {
      targetUserId,
      newPassword: passwordForm.newPassword
    }
  })

  passwordForm.newPassword = ''
  generalMessage.value = 'Password updated successfully.'
}

const handleDeleteUser = async () => {
  deleteError.value = ''
  generalMessage.value = ''

  try {
    await $fetch(`/api/users/${targetUserId}`, {
      method: 'DELETE'
    })

    await navigateTo('/admin/users')
  } catch (error: any) {
    deleteError.value =
      error?.data?.statusMessage ||
      error?.data?.message ||
      'Failed to delete user.'
  }
}
</script>

<template>
  <main class="min-h-screen bg-neutral-100 px-6 py-10">
    <div class="mx-auto max-w-3xl space-y-6">
      <div class="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
        <h1 class="text-2xl font-semibold text-neutral-900">Edit User</h1>
        <p v-if="targetUser" class="mt-2 text-sm text-neutral-600">
          Editing account for {{ targetUser.email }}
        </p>
      </div>

      <div v-if="!targetUser" class="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm text-sm text-neutral-600">
        User not found.
      </div>

      <template v-else>
        <div class="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
          <h2 class="text-lg font-semibold text-neutral-900">Update Name</h2>
          <form class="mt-4 flex gap-3" @submit.prevent="handleUpdateName">
            <input v-model="nameForm.name" type="text" class="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm outline-none transition focus:border-neutral-900" />
            <button type="submit" class="rounded-lg bg-neutral-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-neutral-800">
              Save
            </button>
          </form>
        </div>

        <div class="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
          <h2 class="text-lg font-semibold text-neutral-900">Update Email</h2>
          <form class="mt-4 flex gap-3" @submit.prevent="handleUpdateEmail">
            <input v-model="emailForm.email" type="email" class="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm outline-none transition focus:border-neutral-900" />
            <button type="submit" class="rounded-lg bg-neutral-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-neutral-800">
              Save
            </button>
          </form>
        </div>

        <div class="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
          <h2 class="text-lg font-semibold text-neutral-900">Update Role</h2>
          <form class="mt-4 flex gap-3" @submit.prevent="handleUpdateRole">
            <select v-model="roleForm.role" class="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm outline-none transition focus:border-neutral-900">
              <option value="user">User</option>
              <option value="admin">Admin</option>
            </select>
            <button type="submit" class="rounded-lg bg-neutral-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-neutral-800">
              Save
            </button>
          </form>
        </div>

        <div class="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
          <h2 class="text-lg font-semibold text-neutral-900">Change Password</h2>
          <form class="mt-4 flex gap-3" @submit.prevent="handleChangePassword">
            <input v-model="passwordForm.newPassword" type="password" class="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm outline-none transition focus:border-neutral-900" placeholder="New password" />
            <button type="submit" class="rounded-lg bg-neutral-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-neutral-800">
              Save
            </button>
          </form>
        </div>

        <div class="rounded-2xl border border-red-200 bg-white p-6 shadow-sm">
          <h2 class="text-lg font-semibold text-red-700">Delete Account</h2>
          <p class="mt-2 text-sm text-neutral-600">
            This action cannot be undone.
          </p>

          <p v-if="deleteError" class="mt-3 text-sm text-red-600">
            {{ deleteError }}
          </p>

          <button type="button" class="mt-4 rounded-lg border border-red-300 px-4 py-2 text-sm font-medium text-red-700 transition hover:bg-red-50" @click="handleDeleteUser">
            Delete User
          </button>
        </div>

        <p v-if="generalMessage" class="text-sm text-green-600">
          {{ generalMessage }}
        </p>
      </template>
    </div>
  </main>
</template>