<script setup lang="ts">
import type { PaginatedPropertyListResponse } from "#property-post";

const route = useRoute();
const router = useRouter();

const page = computed(() => Number(route.query.page ?? 1) || 1);
const search = computed(() =>
  typeof route.query.search === "string" ? route.query.search : ""
);

const searchInput = ref(search.value);

const { data, pending, refresh, error } = await useFetch<PaginatedPropertyListResponse>(
  "/api/properties",
  {
    query: computed(() => ({
      page: page.value,
      perPage: 12,
      search: search.value || undefined
    }))
  }
);

const properties = computed(() => data.value?.properties ?? []);
const issueSummary = computed(() => data.value?.issueSummary ?? {});
const pagination = computed(() => data.value?.pagination);

async function applySearch() {
  await router.push({
    query: {
      page: "1",
      search: searchInput.value || undefined
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
  <div class="space-y-8">
    <section class="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
      <h1 class="text-3xl font-semibold text-neutral-900">Documented Properties</h1>
      <p class="mt-2 text-sm text-neutral-600">
        A public record of boarded up, damaged, and visibly neglected properties.
      </p>

      <form class="mt-4 flex gap-3" @submit.prevent="applySearch">
        <input
          v-model="searchInput"
          type="text"
          placeholder="Search by address or description"
          class="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm"
        />
        <button
          type="submit"
          class="rounded-lg bg-neutral-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-neutral-800"
        >
          Search
        </button>
      </form>
    </section>

    <section class="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
      <h2 class="text-xl font-semibold text-neutral-900">Issue Totals</h2>

      <div class="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div
          v-for="(count, issue) in issueSummary"
          :key="issue"
          class="rounded-xl border border-neutral-200 bg-neutral-50 p-4"
        >
          <p class="text-sm text-neutral-500">{{ issue }}</p>
          <p class="mt-1 text-2xl font-semibold text-neutral-900">{{ count }}</p>
        </div>
      </div>
    </section>

    <section class="space-y-4">
      <div v-if="pending" class="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm text-sm text-neutral-600">
        Loading properties...
      </div>

      <div v-else-if="error" class="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
        <p class="text-sm text-red-600">Failed to load properties.</p>
        <button
          type="button"
          class="mt-3 rounded-lg border border-neutral-300 px-4 py-2 text-sm"
          @click="refresh()"
        >
          Retry
        </button>
      </div>

      <div v-else class="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <NuxtLink
          v-for="property in properties"
          :key="property.id"
          :to="`/properties/${property.id}`"
          class="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm transition hover:border-neutral-400 hover:shadow"
        >
          <div class="aspect-[16/10] overflow-hidden rounded-xl border border-neutral-200 bg-neutral-100">
            <img
              v-if="property.primaryImagePath"
              :src="property.primaryImagePath"
              :alt="property.address"
              class="h-full w-full object-cover"
            >
            <div v-else class="flex h-full items-center justify-center text-sm text-neutral-400">
              No image
            </div>
          </div>

          <h2 class="mt-4 text-lg font-semibold text-neutral-900">{{ property.address }}</h2>

          <p class="mt-2 text-sm text-neutral-600">
            {{ property.description || "No description available." }}
          </p>

          <div class="mt-4 flex flex-wrap gap-2">
            <span
              v-for="issue in property.issueCodes"
              :key="issue"
              class="rounded-full border border-neutral-300 px-2.5 py-1 text-xs text-neutral-700"
            >
              {{ issue }}
            </span>
          </div>
        </NuxtLink>
      </div>

      <div v-if="pagination" class="flex items-center justify-between rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
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
    </section>
  </div>
</template>