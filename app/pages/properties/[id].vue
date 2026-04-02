<script setup lang="ts">
import type { SinglePropertyResponse } from "#property-post";

const route = useRoute();
const propertyId = Number(route.params.id);

if (!Number.isInteger(propertyId) || propertyId <= 0) {
  throw createError({
    statusCode: 400,
    statusMessage: "Invalid property ID."
  });
}

const { data, pending, error, refresh } = await useFetch<SinglePropertyResponse>(
  `/api/properties/${propertyId}`
);

const property = computed(() => data.value?.property ?? null);
</script>

<template>
  <div class="space-y-6">
    <div v-if="pending" class="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm text-sm text-neutral-600">
      Loading property...
    </div>

    <div v-else-if="error" class="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
      <p class="text-sm text-red-600">Failed to load property.</p>
      <button
        type="button"
        class="mt-3 rounded-lg border border-neutral-300 px-4 py-2 text-sm"
        @click="refresh()"
      >
        Retry
      </button>
    </div>

    <template v-else-if="property">
      <section class="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
        <h1 class="text-3xl font-semibold text-neutral-900">{{ property.address }}</h1>
        <p class="mt-3 text-neutral-600">
          {{ property.description || "No description available." }}
        </p>
      </section>

      <section class="grid gap-4 lg:grid-cols-2">
        <div class="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
          <h2 class="text-xl font-semibold text-neutral-900">Property Details</h2>

          <dl class="mt-4 space-y-3 text-sm">
            <div class="flex justify-between gap-4">
              <dt class="text-neutral-500">Building Type</dt>
              <dd class="text-neutral-900">{{ property.buildingType }}</dd>
            </div>

            <div class="flex justify-between gap-4">
              <dt class="text-neutral-500">Status</dt>
              <dd class="text-neutral-900">{{ property.status }}</dd>
            </div>

            <div class="flex justify-between gap-4">
              <dt class="text-neutral-500">Severity Rating</dt>
              <dd class="text-neutral-900">{{ property.severityRating ?? "N/A" }}</dd>
            </div>

            <div class="flex justify-between gap-4">
              <dt class="text-neutral-500">Zip Code</dt>
              <dd class="text-neutral-900">{{ property.zipCode ?? "N/A" }}</dd>
            </div>
          </dl>
        </div>

        <div class="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
          <h2 class="text-xl font-semibold text-neutral-900">Issues</h2>

          <div class="mt-4 flex flex-wrap gap-2">
            <span
              v-for="issue in property.issues"
              :key="issue.id"
              class="rounded-full border border-neutral-300 px-3 py-1.5 text-sm text-neutral-700"
            >
              {{ issue.issueCode }}
            </span>
          </div>
        </div>
      </section>

      <section class="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
        <h2 class="text-xl font-semibold text-neutral-900">Images</h2>

        <div class="mt-4 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <figure
            v-for="image in property.images"
            :key="image.id"
            class="overflow-hidden rounded-xl border border-neutral-200 bg-neutral-50"
          >
            <img :src="image.imagePath" :alt="image.caption || property.address" class="aspect-[16/10] w-full object-cover" />
            <figcaption class="p-3 text-sm text-neutral-600">
              {{ image.caption || "No caption provided." }}
            </figcaption>
          </figure>
        </div>
      </section>

      <section class="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
        <h2 class="text-xl font-semibold text-neutral-900">Observations</h2>

        <div class="mt-4 space-y-4">
          <article
            v-for="observation in property.observations"
            :key="observation.id"
            class="rounded-xl border border-neutral-200 p-4"
          >
            <p class="text-sm text-neutral-500">
              Observed: {{ new Date(observation.observedAt).toLocaleString() }}
            </p>

            <p class="mt-2 text-sm text-neutral-700">
              {{ observation.description || "No observation description." }}
            </p>

            <p v-if="observation.notes" class="mt-2 text-sm text-neutral-500">
              Notes: {{ observation.notes }}
            </p>
          </article>
        </div>
      </section>
    </template>
  </div>
</template>