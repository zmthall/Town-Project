<script setup lang="ts">
import type { PaginatedPropertyListResponse } from "#property-post";

definePageMeta({
  layout: "admin",
  middleware: "auth"
});

const route = useRoute();
const router = useRouter();

const page = computed(() => Number(route.query.page ?? 1) || 1);
const search = computed(() =>
  typeof route.query.search === "string" ? route.query.search : ""
);
const buildingType = computed(() =>
  typeof route.query.buildingType === "string" ? route.query.buildingType : ""
);
const status = computed(() =>
  typeof route.query.status === "string" ? route.query.status : ""
);

const searchInput = ref(search.value);
const buildingTypeInput = ref(buildingType.value);
const statusInput = ref(status.value);

const { data, pending, refresh, error } = await useFetch<PaginatedPropertyListResponse>(
  "/api/properties",
  {
    query: computed(() => ({
      page: page.value,
      perPage: 12,
      search: search.value || undefined,
      buildingType: buildingType.value || undefined,
      status: status.value || undefined
    }))
  }
);

const properties = computed(() => data.value?.properties ?? []);
const pagination = computed(() => data.value?.pagination);

async function applyFilters() {
  await router.push({
    query: {
      page: "1",
      search: searchInput.value || undefined,
      buildingType: buildingTypeInput.value || undefined,
      status: statusInput.value || undefined
    }
  });
}

async function goToPage(nextPage: number) {
  await router.push({
    query: {
      ...route.query,
      page: String(nextPage)
    }
  });
}
</script>

<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between gap-4 rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
      <div>
        <h1 class="text-2xl font-semibold text-neutral-900">Properties</h1>
        <p class="mt-2 text-sm text-neutral-600">
          Manage all documented properties.
        </p>
      </div>

      <NuxtLink
        to="/admin/properties/create"
        class="inline-flex items-center justify-center rounded-lg bg-neutral-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-neutral-800"
      >
        Create Property
      </NuxtLink>
    </div>

    <div class="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
      <form class="grid gap-4 md:grid-cols-4" @submit.prevent="applyFilters">
        <input
          v-model="searchInput"
          type="text"
          placeholder="Search address or description"
          class="rounded-lg border border-neutral-300 px-3 py-2 text-sm"
        />

        <select v-model="buildingTypeInput" class="rounded-lg border border-neutral-300 px-3 py-2 text-sm">
          <option value="">All building types</option>
          <option value="residential">Residential</option>
          <option value="commercial">Commercial</option>
          <option value="industrial">Industrial</option>
          <option value="mixed_use">Mixed Use</option>
          <option value="public">Public</option>
          <option value="unknown">Unknown</option>
        </select>

        <select v-model="statusInput" class="rounded-lg border border-neutral-300 px-3 py-2 text-sm">
          <option value="">All statuses</option>
          <option value="active">Active</option>
          <option value="improved">Improved</option>
          <option value="demolished">Demolished</option>
          <option value="archived">Archived</option>
        </select>

        <button
          type="submit"
          class="rounded-lg bg-neutral-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-neutral-800"
        >
          Apply Filters
        </button>
      </form>
    </div>

    <div class="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
      <div v-if="pending" class="text-sm text-neutral-600">Loading properties...</div>

      <div v-else-if="error" class="space-y-3">
        <p class="text-sm text-red-600">Failed to load properties.</p>
        <button
          type="button"
          class="rounded-lg border border-neutral-300 px-4 py-2 text-sm"
          @click="refresh()"
        >
          Retry
        </button>
      </div>

      <div v-else class="overflow-x-auto">
        <table class="min-w-full border-collapse">
          <thead>
            <tr class="border-b border-neutral-200 text-left text-sm text-neutral-600">
              <th class="px-3 py-3 font-medium">ID</th>
              <th class="px-3 py-3 font-medium">Address</th>
              <th class="px-3 py-3 font-medium">Type</th>
              <th class="px-3 py-3 font-medium">Status</th>
              <th class="px-3 py-3 font-medium">Issues</th>
              <th class="px-3 py-3 font-medium">Actions</th>
            </tr>
          </thead>

          <tbody>
            <tr
              v-for="property in properties"
              :key="property.id"
              class="border-b border-neutral-100 text-sm text-neutral-800"
            >
              <td class="px-3 py-3">{{ property.id }}</td>
              <td class="px-3 py-3">{{ property.address }}</td>
              <td class="px-3 py-3">{{ property.buildingType }}</td>
              <td class="px-3 py-3">{{ property.status }}</td>
              <td class="px-3 py-3">{{ property.issueCodes.join(", ") || "None" }}</td>
              <td class="px-3 py-3">
                <NuxtLink
                  :to="`/admin/properties/${property.id}`"
                  class="font-medium text-neutral-900 underline underline-offset-2"
                >
                  Edit
                </NuxtLink>
              </td>
            </tr>
          </tbody>
        </table>

        <div v-if="pagination" class="mt-6 flex items-center justify-between">
          <button
            type="button"
            :disabled="!pagination.hasPreviousPage"
            class="rounded-lg border border-neutral-300 px-4 py-2 text-sm disabled:opacity-50"
            @click="goToPage(pagination.page - 1)"
          >
            Previous
          </button>

          <p class="text-sm text-neutral-600">
            Page {{ pagination.page }} of {{ pagination.totalPages }}
          </p>

          <button
            type="button"
            :disabled="!pagination.hasNextPage"
            class="rounded-lg border border-neutral-300 px-4 py-2 text-sm disabled:opacity-50"
            @click="goToPage(pagination.page + 1)"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  </div>
</template>