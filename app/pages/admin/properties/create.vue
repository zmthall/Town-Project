<script setup lang="ts">
import type {
  CreatePropertyInput,
  PropertyIssueCode,
  VisibilitySource,
  OccupancyStatus,
  OccupancyVerificationMethod,
  OccupantRelationshipToProperty
} from "#property-post";

definePageMeta({
  layout: "admin",
  middleware: "auth"
});

const router = useRouter();

const isSubmitting = ref(false);
const errorMessage = ref("");
const successMessage = ref("");

const propertyForm = reactive<CreatePropertyInput>({
  address: "",
  zipCode: null,
  buildingType: "unknown",
  status: "active",
  latitude: null,
  longitude: null,
  severityRating: null,
  description: null
});

const selectedIssues = ref<PropertyIssueCode[]>([]);

const imageForm = reactive({
  imagePath: "",
  caption: "",
  isPrimary: false
});

const pendingImages = ref<
  Array<{
    imagePath: string;
    caption: string | null;
    isPrimary: boolean;
  }>
>([]);

const observationForm = reactive({
  observedAt: new Date().toISOString().slice(0, 16),
  description: "",
  severityRating: null as number | null,
  visibilitySource: "street" as VisibilitySource,
  occupancyStatus: "unknown" as OccupancyStatus,
  occupancyVerificationMethod: "visual_only" as OccupancyVerificationMethod,
  occupantContactMade: false,
  occupantRelationshipToProperty: null as OccupantRelationshipToProperty | null,
  occupantFirstName: "",
  occupantLastName: "",
  occupantCount: null as number | null,
  occupantComment: "",
  notes: ""
});

const pendingObservations = ref<
  Array<{
    observedAt: string;
    description: string | null;
    severityRating: number | null;
    visibilitySource: VisibilitySource;
    occupancyStatus: OccupancyStatus;
    occupancyVerificationMethod: OccupancyVerificationMethod;
    occupantContactMade: boolean;
    occupantRelationshipToProperty: OccupantRelationshipToProperty | null;
    occupantFirstName: string | null;
    occupantLastName: string | null;
    occupantCount: number | null;
    occupantComment: string | null;
    notes: string | null;
  }>
>([]);

const issueOptions: { value: PropertyIssueCode; label: string }[] = [
  { value: "boarded_up", label: "Boarded Up" },
  { value: "fire_damage", label: "Fire Damage" },
  { value: "falling_apart", label: "Falling Apart" },
  { value: "mid_demolition", label: "Mid Demolition" },
  { value: "broken_windows", label: "Broken Windows" },
  { value: "unsecured_entry", label: "Unsecured Entry" },
  { value: "roof_damage", label: "Roof Damage" },
  { value: "structural_damage", label: "Structural Damage" },
  { value: "graffiti", label: "Graffiti" },
  { value: "trash_debris", label: "Trash / Debris" },
  { value: "overgrown_lot", label: "Overgrown Lot" },
  { value: "water_damage", label: "Water Damage" },
  { value: "foundation_damage", label: "Foundation Damage" },
  { value: "unsafe_stairs_or_porches", label: "Unsafe Stairs / Porches" },
  { value: "other", label: "Other" }
];

function toggleIssue(issueCode: PropertyIssueCode) {
  if (selectedIssues.value.includes(issueCode)) {
    selectedIssues.value = selectedIssues.value.filter((issue) => issue !== issueCode);
    return;
  }

  selectedIssues.value = [...selectedIssues.value, issueCode];
}

function resetImageForm() {
  imageForm.imagePath = "";
  imageForm.caption = "";
  imageForm.isPrimary = false;
}

function addPendingImage() {
  if (!imageForm.imagePath.trim()) {
    return;
  }

  if (imageForm.isPrimary) {
    pendingImages.value = pendingImages.value.map((image) => ({
      ...image,
      isPrimary: false
    }));
  }

  pendingImages.value.push({
    imagePath: imageForm.imagePath.trim(),
    caption: imageForm.caption.trim() || null,
    isPrimary: imageForm.isPrimary
  });

  resetImageForm();
}

function removePendingImage(index: number) {
  pendingImages.value.splice(index, 1);
}

function resetObservationForm() {
  observationForm.observedAt = new Date().toISOString().slice(0, 16);
  observationForm.description = "";
  observationForm.severityRating = null;
  observationForm.visibilitySource = "street";
  observationForm.occupancyStatus = "unknown";
  observationForm.occupancyVerificationMethod = "visual_only";
  observationForm.occupantContactMade = false;
  observationForm.occupantRelationshipToProperty = null;
  observationForm.occupantFirstName = "";
  observationForm.occupantLastName = "";
  observationForm.occupantCount = null;
  observationForm.occupantComment = "";
  observationForm.notes = "";
}

function addPendingObservation() {
  if (!observationForm.observedAt) {
    return;
  }

  pendingObservations.value.push({
    observedAt: new Date(observationForm.observedAt).toISOString(),
    description: observationForm.description.trim() || null,
    severityRating: observationForm.severityRating,
    visibilitySource: observationForm.visibilitySource,
    occupancyStatus: observationForm.occupancyStatus,
    occupancyVerificationMethod: observationForm.occupancyVerificationMethod,
    occupantContactMade: observationForm.occupantContactMade,
    occupantRelationshipToProperty: observationForm.occupantRelationshipToProperty,
    occupantFirstName: observationForm.occupantFirstName.trim() || null,
    occupantLastName: observationForm.occupantLastName.trim() || null,
    occupantCount: observationForm.occupantCount,
    occupantComment: observationForm.occupantComment.trim() || null,
    notes: observationForm.notes.trim() || null
  });

  resetObservationForm();
}

function removePendingObservation(index: number) {
  pendingObservations.value.splice(index, 1);
}

async function handleCreateProperty() {
  errorMessage.value = "";
  successMessage.value = "";
  isSubmitting.value = true;

  try {
    const createResponse = await $fetch<{ success: true; property: { id: number } }>("/api/properties", {
      method: "POST",
      body: propertyForm
    });

    const propertyId = createResponse.property.id;

    for (const issueCode of selectedIssues.value) {
      await $fetch(`/api/properties/${propertyId}/issues`, {
        method: "POST",
        body: { issueCode }
      });
    }

    for (const image of pendingImages.value) {
      await $fetch(`/api/properties/${propertyId}/images`, {
        method: "POST",
        body: image
      });
    }

    for (const observation of pendingObservations.value) {
      await $fetch(`/api/properties/${propertyId}/observations`, {
        method: "POST",
        body: observation
      });
    }

    successMessage.value = "Property created successfully.";
    await router.push(`/admin/properties/${propertyId}`);
  } catch (error: any) {
    errorMessage.value =
      error?.data?.statusMessage ||
      error?.data?.message ||
      "Failed to create property.";
  } finally {
    isSubmitting.value = false;
  }
}
</script>

<template>
  <div class="space-y-6">
    <div class="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
      <h1 class="text-2xl font-semibold text-neutral-900">Create Property</h1>
      <p class="mt-2 text-sm text-neutral-600">
        Create a new property record with issues, images, and observations.
      </p>
    </div>

    <form class="space-y-6" @submit.prevent="handleCreateProperty">
      <section class="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
        <h2 class="text-lg font-semibold text-neutral-900">Main Property Details</h2>

        <div class="mt-4 grid gap-4 md:grid-cols-2">
          <div class="md:col-span-2">
            <label class="mb-1 block text-sm font-medium text-neutral-700">Address</label>
            <input v-model="propertyForm.address" type="text" class="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm" />
          </div>

          <div>
            <label class="mb-1 block text-sm font-medium text-neutral-700">Zip Code</label>
            <input v-model="propertyForm.zipCode" type="text" class="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm" />
          </div>

          <div>
            <label class="mb-1 block text-sm font-medium text-neutral-700">Building Type</label>
            <select v-model="propertyForm.buildingType" class="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm">
              <option value="residential">Residential</option>
              <option value="commercial">Commercial</option>
              <option value="industrial">Industrial</option>
              <option value="mixed_use">Mixed Use</option>
              <option value="public">Public</option>
              <option value="unknown">Unknown</option>
            </select>
          </div>

          <div>
            <label class="mb-1 block text-sm font-medium text-neutral-700">Status</label>
            <select v-model="propertyForm.status" class="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm">
              <option value="active">Active</option>
              <option value="improved">Improved</option>
              <option value="demolished">Demolished</option>
              <option value="archived">Archived</option>
            </select>
          </div>

          <div>
            <label class="mb-1 block text-sm font-medium text-neutral-700">Latitude</label>
            <input v-model.number="propertyForm.latitude" type="number" step="0.000001" class="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm" />
          </div>

          <div>
            <label class="mb-1 block text-sm font-medium text-neutral-700">Longitude</label>
            <input v-model.number="propertyForm.longitude" type="number" step="0.000001" class="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm" />
          </div>

          <div>
            <label class="mb-1 block text-sm font-medium text-neutral-700">Severity Rating</label>
            <input v-model.number="propertyForm.severityRating" type="number" min="1" max="5" class="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm" />
          </div>

          <div class="md:col-span-2">
            <label class="mb-1 block text-sm font-medium text-neutral-700">Description</label>
            <textarea v-model="propertyForm.description" rows="5" class="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm" />
          </div>
        </div>
      </section>

      <section class="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
        <h2 class="text-lg font-semibold text-neutral-900">Issues</h2>

        <div class="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <label
            v-for="option in issueOptions"
            :key="option.value"
            class="flex items-center gap-3 rounded-lg border border-neutral-200 px-4 py-3 text-sm"
          >
            <input
              :checked="selectedIssues.includes(option.value)"
              type="checkbox"
              @change="toggleIssue(option.value)"
            />
            <span>{{ option.label }}</span>
          </label>
        </div>
      </section>

      <section class="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
        <h2 class="text-lg font-semibold text-neutral-900">Images</h2>

        <div class="mt-4 grid gap-4 md:grid-cols-2">
          <div class="md:col-span-2">
            <label class="mb-1 block text-sm font-medium text-neutral-700">Image Path</label>
            <input v-model="imageForm.imagePath" type="text" class="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm" />
          </div>

          <div class="md:col-span-2">
            <label class="mb-1 block text-sm font-medium text-neutral-700">Caption</label>
            <input v-model="imageForm.caption" type="text" class="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm" />
          </div>

          <label class="flex items-center gap-2 text-sm text-neutral-700">
            <input v-model="imageForm.isPrimary" type="checkbox" />
            Primary image
          </label>

          <div>
            <button type="button" class="rounded-lg bg-neutral-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-neutral-800" @click="addPendingImage">
              Add Image
            </button>
          </div>
        </div>

        <div class="mt-6 space-y-3">
          <div
            v-for="(image, index) in pendingImages"
            :key="`${image.imagePath}-${index}`"
            class="flex items-start justify-between gap-4 rounded-lg border border-neutral-200 p-4"
          >
            <div class="min-w-0">
              <p class="break-all text-sm font-medium text-neutral-900">{{ image.imagePath }}</p>
              <p class="mt-1 text-sm text-neutral-600">{{ image.caption || "No caption" }}</p>
              <p class="mt-1 text-xs text-neutral-500">{{ image.isPrimary ? "Primary image" : "Secondary image" }}</p>
            </div>

            <button type="button" class="rounded-lg border border-red-300 px-3 py-1.5 text-sm text-red-700 transition hover:bg-red-50" @click="removePendingImage(index)">
              Remove
            </button>
          </div>
        </div>
      </section>

      <section class="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
        <h2 class="text-lg font-semibold text-neutral-900">Observations</h2>

        <div class="mt-4 grid gap-4 md:grid-cols-2">
          <div>
            <label class="mb-1 block text-sm font-medium text-neutral-700">Observed At</label>
            <input v-model="observationForm.observedAt" type="datetime-local" class="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm" />
          </div>

          <div>
            <label class="mb-1 block text-sm font-medium text-neutral-700">Severity Rating</label>
            <input v-model.number="observationForm.severityRating" type="number" min="1" max="5" class="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm" />
          </div>

          <div>
            <label class="mb-1 block text-sm font-medium text-neutral-700">Visibility Source</label>
            <select v-model="observationForm.visibilitySource" class="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm">
              <option value="street">Street</option>
              <option value="sidewalk">Sidewalk</option>
              <option value="alley">Alley</option>
              <option value="public_lot">Public Lot</option>
              <option value="spoke_with_occupant">Spoke with Occupant</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div>
            <label class="mb-1 block text-sm font-medium text-neutral-700">Occupancy Status</label>
            <select v-model="observationForm.occupancyStatus" class="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm">
              <option value="unknown">Unknown</option>
              <option value="appears_occupied">Appears Occupied</option>
              <option value="appears_vacant">Appears Vacant</option>
              <option value="confirmed_occupied">Confirmed Occupied</option>
              <option value="confirmed_vacant">Confirmed Vacant</option>
            </select>
          </div>

          <div>
            <label class="mb-1 block text-sm font-medium text-neutral-700">Verification Method</label>
            <select v-model="observationForm.occupancyVerificationMethod" class="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm">
              <option value="visual_only">Visual Only</option>
              <option value="spoke_with_occupant">Spoke with Occupant</option>
              <option value="spoke_with_neighbor">Spoke with Neighbor</option>
              <option value="public_record">Public Record</option>
              <option value="other">Other</option>
            </select>
          </div>

          <label class="flex items-center gap-2 text-sm text-neutral-700">
            <input v-model="observationForm.occupantContactMade" type="checkbox" />
            Occupant contact made
          </label>

          <div>
            <label class="mb-1 block text-sm font-medium text-neutral-700">Relationship to Property</label>
            <select v-model="observationForm.occupantRelationshipToProperty" class="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm">
              <option :value="null">None</option>
              <option value="owner">Owner</option>
              <option value="renter">Renter</option>
              <option value="resident_unknown">Resident Unknown</option>
              <option value="not_provided">Not Provided</option>
            </select>
          </div>

          <div>
            <label class="mb-1 block text-sm font-medium text-neutral-700">Occupant First Name</label>
            <input v-model="observationForm.occupantFirstName" type="text" class="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm" />
          </div>

          <div>
            <label class="mb-1 block text-sm font-medium text-neutral-700">Occupant Last Name</label>
            <input v-model="observationForm.occupantLastName" type="text" class="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm" />
          </div>

          <div>
            <label class="mb-1 block text-sm font-medium text-neutral-700">Occupant Count</label>
            <input v-model.number="observationForm.occupantCount" type="number" min="0" class="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm" />
          </div>

          <div class="md:col-span-2">
            <label class="mb-1 block text-sm font-medium text-neutral-700">Observation Description</label>
            <textarea v-model="observationForm.description" rows="4" class="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm" />
          </div>

          <div class="md:col-span-2">
            <label class="mb-1 block text-sm font-medium text-neutral-700">Occupant Comment</label>
            <textarea v-model="observationForm.occupantComment" rows="3" class="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm" />
          </div>

          <div class="md:col-span-2">
            <label class="mb-1 block text-sm font-medium text-neutral-700">Notes</label>
            <textarea v-model="observationForm.notes" rows="3" class="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm" />
          </div>

          <div class="md:col-span-2">
            <button type="button" class="rounded-lg bg-neutral-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-neutral-800" @click="addPendingObservation">
              Add Observation
            </button>
          </div>
        </div>

        <div class="mt-6 space-y-3">
          <div
            v-for="(observation, index) in pendingObservations"
            :key="`${observation.observedAt}-${index}`"
            class="rounded-lg border border-neutral-200 p-4"
          >
            <div class="flex items-start justify-between gap-4">
              <div class="min-w-0">
                <p class="text-sm font-medium text-neutral-900">
                  {{ new Date(observation.observedAt).toLocaleString() }}
                </p>
                <p class="mt-1 text-sm text-neutral-600">
                  {{ observation.description || "No description" }}
                </p>
                <p class="mt-1 text-xs text-neutral-500">
                  {{ observation.visibilitySource }} · {{ observation.occupancyStatus }}
                </p>
              </div>

              <button type="button" class="rounded-lg border border-red-300 px-3 py-1.5 text-sm text-red-700 transition hover:bg-red-50" @click="removePendingObservation(index)">
                Remove
              </button>
            </div>
          </div>
        </div>
      </section>

      <div v-if="errorMessage" class="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
        {{ errorMessage }}
      </div>

      <div v-if="successMessage" class="rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
        {{ successMessage }}
      </div>

      <div>
        <button
          type="submit"
          :disabled="isSubmitting"
          class="rounded-lg bg-neutral-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-neutral-800 disabled:opacity-60"
        >
          {{ isSubmitting ? "Creating..." : "Create Property" }}
        </button>
      </div>
    </form>
  </div>
</template>