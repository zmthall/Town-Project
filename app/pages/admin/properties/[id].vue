<script setup lang="ts">
import type {
  PropertyIssueCode,
  SinglePropertyResponse,
  UpdatePropertyInput,
  VisibilitySource,
  OccupancyStatus,
  OccupancyVerificationMethod,
  OccupantRelationshipToProperty
} from "#property-post";

definePageMeta({
  layout: "admin",
  middleware: "auth"
});

const route = useRoute();
const router = useRouter();
const propertyId = Number(route.params.id);

if (!Number.isInteger(propertyId) || propertyId <= 0) {
  throw createError({
    statusCode: 400,
    statusMessage: "Invalid property ID."
  });
}

const { data, pending, refresh, error } = await useFetch<SinglePropertyResponse>(
  `/api/properties/${propertyId}`
);

const property = computed(() => data.value?.property ?? null);

const form = reactive<UpdatePropertyInput>({
  address: "",
  zipCode: null,
  buildingType: "unknown",
  status: "active",
  latitude: null,
  longitude: null,
  severityRating: null,
  description: null
});

watchEffect(() => {
  if (!property.value) {
    return;
  }

  form.address = property.value.address;
  form.zipCode = property.value.zipCode;
  form.buildingType = property.value.buildingType;
  form.status = property.value.status;
  form.latitude = property.value.latitude;
  form.longitude = property.value.longitude;
  form.severityRating = property.value.severityRating;
  form.description = property.value.description;
});

const updateMessage = ref("");
const updateError = ref("");

async function handleUpdateProperty() {
  updateMessage.value = "";
  updateError.value = "";

  try {
    await $fetch(`/api/properties/${propertyId}`, {
      method: "PATCH",
      body: form
    });

    updateMessage.value = "Property updated successfully.";
    await refresh();
  } catch (error: any) {
    updateError.value =
      error?.data?.statusMessage ||
      error?.data?.message ||
      "Failed to update property.";
  }
}

const issueCode = ref<PropertyIssueCode>("boarded_up");
const issueError = ref("");

async function handleAddIssue() {
  issueError.value = "";

  try {
    await $fetch(`/api/properties/${propertyId}/issues`, {
      method: "POST",
      body: { issueCode: issueCode.value }
    });

    await refresh();
  } catch (error: any) {
    issueError.value =
      error?.data?.statusMessage ||
      error?.data?.message ||
      "Failed to add issue.";
  }
}

async function handleDeleteIssue(issueId: number) {
  try {
    await $fetch(`/api/properties/${propertyId}/issues/${issueId}`, {
      method: "DELETE"
    });

    await refresh();
  } catch (error) {
    console.error(error);
  }
}

const imageForm = reactive({
  imagePath: "",
  caption: "",
  isPrimary: false
});

const imageMessage = ref("");
const imageError = ref("");
const editingImageId = ref<number | null>(null);

function resetImageForm() {
  imageForm.imagePath = "";
  imageForm.caption = "";
  imageForm.isPrimary = false;
  editingImageId.value = null;
}

function startEditImage(image: {
  id: number;
  imagePath: string;
  caption: string | null;
  isPrimary: boolean;
}) {
  editingImageId.value = image.id;
  imageForm.imagePath = image.imagePath;
  imageForm.caption = image.caption || "";
  imageForm.isPrimary = image.isPrimary;
}

async function handleSaveImage() {
  imageMessage.value = "";
  imageError.value = "";

  try {
    if (editingImageId.value) {
      await $fetch(`/api/properties/${propertyId}/images/${editingImageId.value}`, {
        method: "PATCH",
        body: {
          imagePath: imageForm.imagePath,
          caption: imageForm.caption || null,
          isPrimary: imageForm.isPrimary
        }
      });

      imageMessage.value = "Image updated successfully.";
    } else {
      await $fetch(`/api/properties/${propertyId}/images`, {
        method: "POST",
        body: {
          imagePath: imageForm.imagePath,
          caption: imageForm.caption || null,
          isPrimary: imageForm.isPrimary
        }
      });

      imageMessage.value = "Image added successfully.";
    }

    resetImageForm();
    await refresh();
  } catch (error: any) {
    imageError.value =
      error?.data?.statusMessage ||
      error?.data?.message ||
      "Failed to save image.";
  }
}

async function handleDeleteImage(imageId: number) {
  try {
    await $fetch(`/api/properties/${propertyId}/images/${imageId}`, {
      method: "DELETE"
    });

    if (editingImageId.value === imageId) {
      resetImageForm();
    }

    await refresh();
  } catch (error) {
    console.error(error);
  }
}

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

const observationMessage = ref("");
const observationError = ref("");
const editingObservationId = ref<number | null>(null);

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
  editingObservationId.value = null;
}

function startEditObservation(observation: any) {
  editingObservationId.value = observation.id;
  observationForm.observedAt = new Date(observation.observedAt).toISOString().slice(0, 16);
  observationForm.description = observation.description || "";
  observationForm.severityRating = observation.severityRating;
  observationForm.visibilitySource = observation.visibilitySource;
  observationForm.occupancyStatus = observation.occupancyStatus;
  observationForm.occupancyVerificationMethod = observation.occupancyVerificationMethod;
  observationForm.occupantContactMade = observation.occupantContactMade;
  observationForm.occupantRelationshipToProperty = observation.occupantRelationshipToProperty;
  observationForm.occupantFirstName = observation.occupantFirstName || "";
  observationForm.occupantLastName = observation.occupantLastName || "";
  observationForm.occupantCount = observation.occupantCount;
  observationForm.occupantComment = observation.occupantComment || "";
  observationForm.notes = observation.notes || "";
}

async function handleSaveObservation() {
  observationMessage.value = "";
  observationError.value = "";

  const payload = {
    observedAt: new Date(observationForm.observedAt).toISOString(),
    description: observationForm.description || null,
    severityRating: observationForm.severityRating,
    visibilitySource: observationForm.visibilitySource,
    occupancyStatus: observationForm.occupancyStatus,
    occupancyVerificationMethod: observationForm.occupancyVerificationMethod,
    occupantContactMade: observationForm.occupantContactMade,
    occupantRelationshipToProperty: observationForm.occupantRelationshipToProperty,
    occupantFirstName: observationForm.occupantFirstName || null,
    occupantLastName: observationForm.occupantLastName || null,
    occupantCount: observationForm.occupantCount,
    occupantComment: observationForm.occupantComment || null,
    notes: observationForm.notes || null
  };

  try {
    if (editingObservationId.value) {
      await $fetch(`/api/properties/${propertyId}/observations/${editingObservationId.value}`, {
        method: "PATCH",
        body: payload
      });

      observationMessage.value = "Observation updated successfully.";
    } else {
      await $fetch(`/api/properties/${propertyId}/observations`, {
        method: "POST",
        body: payload
      });

      observationMessage.value = "Observation added successfully.";
    }

    resetObservationForm();
    await refresh();
  } catch (error: any) {
    observationError.value =
      error?.data?.statusMessage ||
      error?.data?.message ||
      "Failed to save observation.";
  }
}

async function handleDeleteObservation(observationId: number) {
  try {
    await $fetch(`/api/properties/${propertyId}/observations/${observationId}`, {
      method: "DELETE"
    });

    if (editingObservationId.value === observationId) {
      resetObservationForm();
    }

    await refresh();
  } catch (error) {
    console.error(error);
  }
}

async function handleDeleteProperty() {
  await $fetch(`/api/properties/${propertyId}`, {
    method: "DELETE"
  });

  await router.push("/admin/properties");
}

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
</script>

<template>
  <div class="space-y-6">
    <div class="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
      <h1 class="text-2xl font-semibold text-neutral-900">Edit Property</h1>
      <p v-if="property" class="mt-2 text-sm text-neutral-600">
        {{ property.address }}
      </p>
    </div>

    <div v-if="pending" class="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm text-sm text-neutral-600">
      Loading property...
    </div>

    <div v-else-if="error" class="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm text-sm text-red-600">
      Failed to load property.
    </div>

    <template v-else-if="property">
      <section class="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
        <h2 class="text-lg font-semibold text-neutral-900">Main Property Details</h2>

        <form class="mt-4 grid gap-4 md:grid-cols-2" @submit.prevent="handleUpdateProperty">
          <div class="md:col-span-2">
            <label class="mb-1 block text-sm font-medium text-neutral-700">Address</label>
            <input v-model="form.address" type="text" class="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm" />
          </div>

          <div>
            <label class="mb-1 block text-sm font-medium text-neutral-700">Zip Code</label>
            <input v-model="form.zipCode" type="text" class="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm" />
          </div>

          <div>
            <label class="mb-1 block text-sm font-medium text-neutral-700">Building Type</label>
            <select v-model="form.buildingType" class="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm">
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
            <select v-model="form.status" class="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm">
              <option value="active">Active</option>
              <option value="improved">Improved</option>
              <option value="demolished">Demolished</option>
              <option value="archived">Archived</option>
            </select>
          </div>

          <div>
            <label class="mb-1 block text-sm font-medium text-neutral-700">Latitude</label>
            <input v-model.number="form.latitude" type="number" step="0.000001" class="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm" />
          </div>

          <div>
            <label class="mb-1 block text-sm font-medium text-neutral-700">Longitude</label>
            <input v-model.number="form.longitude" type="number" step="0.000001" class="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm" />
          </div>

          <div>
            <label class="mb-1 block text-sm font-medium text-neutral-700">Severity Rating</label>
            <input v-model.number="form.severityRating" type="number" min="1" max="5" class="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm" />
          </div>

          <div class="md:col-span-2">
            <label class="mb-1 block text-sm font-medium text-neutral-700">Description</label>
            <textarea v-model="form.description" rows="5" class="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm" />
          </div>

          <div v-if="updateError" class="md:col-span-2 text-sm text-red-600">
            {{ updateError }}
          </div>

          <div v-if="updateMessage" class="md:col-span-2 text-sm text-green-600">
            {{ updateMessage }}
          </div>

          <div class="md:col-span-2">
            <button type="submit" class="rounded-lg bg-neutral-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-neutral-800">
              Save Property
            </button>
          </div>
        </form>
      </section>

      <section class="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
        <h2 class="text-lg font-semibold text-neutral-900">Issues</h2>

        <form class="mt-4 flex flex-col gap-3 md:flex-row" @submit.prevent="handleAddIssue">
          <select v-model="issueCode" class="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm">
            <option v-for="option in issueOptions" :key="option.value" :value="option.value">
              {{ option.label }}
            </option>
          </select>

          <button type="submit" class="rounded-lg bg-neutral-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-neutral-800">
            Add Issue
          </button>
        </form>

        <p v-if="issueError" class="mt-3 text-sm text-red-600">{{ issueError }}</p>

        <div class="mt-4 space-y-3">
          <div
            v-for="issue in property.issues"
            :key="issue.id"
            class="flex items-center justify-between rounded-lg border border-neutral-200 px-4 py-3 text-sm"
          >
            <span>{{ issue.issueCode }}</span>

            <button
              type="button"
              class="rounded-lg border border-red-300 px-3 py-1.5 text-sm text-red-700 transition hover:bg-red-50"
              @click="handleDeleteIssue(issue.id)"
            >
              Remove
            </button>
          </div>
        </div>
      </section>

      <section class="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
        <div class="flex items-center justify-between gap-4">
          <h2 class="text-lg font-semibold text-neutral-900">Images</h2>
          <button
            type="button"
            class="rounded-lg border border-neutral-300 px-3 py-1.5 text-sm"
            @click="resetImageForm"
          >
            Clear Image Form
          </button>
        </div>

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
            <button type="button" class="rounded-lg bg-neutral-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-neutral-800" @click="handleSaveImage">
              {{ editingImageId ? "Update Image" : "Add Image" }}
            </button>
          </div>
        </div>

        <p v-if="imageError" class="mt-3 text-sm text-red-600">{{ imageError }}</p>
        <p v-if="imageMessage" class="mt-3 text-sm text-green-600">{{ imageMessage }}</p>

        <div class="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          <div
            v-for="image in property.images"
            :key="image.id"
            class="rounded-xl border border-neutral-200 bg-neutral-50 p-4"
          >
            <div class="aspect-[16/10] overflow-hidden rounded-lg border border-neutral-200 bg-white">
              <img :src="image.imagePath" :alt="image.caption || property.address" class="h-full w-full object-cover" />
            </div>

            <p class="mt-3 break-all text-sm font-medium text-neutral-900">{{ image.imagePath }}</p>
            <p class="mt-1 text-sm text-neutral-600">{{ image.caption || "No caption" }}</p>
            <p class="mt-1 text-xs text-neutral-500">{{ image.isPrimary ? "Primary image" : "Secondary image" }}</p>

            <div class="mt-4 flex gap-2">
              <button type="button" class="rounded-lg border border-neutral-300 px-3 py-1.5 text-sm" @click="startEditImage(image)">
                Edit
              </button>
              <button type="button" class="rounded-lg border border-red-300 px-3 py-1.5 text-sm text-red-700 transition hover:bg-red-50" @click="handleDeleteImage(image.id)">
                Delete
              </button>
            </div>
          </div>
        </div>
      </section>

      <section class="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
        <div class="flex items-center justify-between gap-4">
          <h2 class="text-lg font-semibold text-neutral-900">Observations</h2>
          <button
            type="button"
            class="rounded-lg border border-neutral-300 px-3 py-1.5 text-sm"
            @click="resetObservationForm"
          >
            Clear Observation Form
          </button>
        </div>

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
            <button type="button" class="rounded-lg bg-neutral-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-neutral-800" @click="handleSaveObservation">
              {{ editingObservationId ? "Update Observation" : "Add Observation" }}
            </button>
          </div>
        </div>

        <p v-if="observationError" class="mt-3 text-sm text-red-600">{{ observationError }}</p>
        <p v-if="observationMessage" class="mt-3 text-sm text-green-600">{{ observationMessage }}</p>

        <div class="mt-6 space-y-4">
          <div
            v-for="observation in property.observations"
            :key="observation.id"
            class="rounded-xl border border-neutral-200 p-4"
          >
            <div class="flex items-start justify-between gap-4">
              <div>
                <p class="text-sm font-medium text-neutral-900">
                  {{ new Date(observation.observedAt).toLocaleString() }}
                </p>
                <p class="mt-1 text-sm text-neutral-600">
                  {{ observation.description || "No observation description." }}
                </p>
                <p class="mt-1 text-xs text-neutral-500">
                  {{ observation.visibilitySource }} · {{ observation.occupancyStatus }}
                </p>
              </div>

              <div class="flex gap-2">
                <button type="button" class="rounded-lg border border-neutral-300 px-3 py-1.5 text-sm" @click="startEditObservation(observation)">
                  Edit
                </button>
                <button type="button" class="rounded-lg border border-red-300 px-3 py-1.5 text-sm text-red-700 transition hover:bg-red-50" @click="handleDeleteObservation(observation.id)">
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section class="rounded-2xl border border-red-200 bg-white p-6 shadow-sm">
        <h2 class="text-lg font-semibold text-red-700">Delete Property</h2>
        <p class="mt-2 text-sm text-neutral-600">This action cannot be undone.</p>

        <button
          type="button"
          class="mt-4 rounded-lg border border-red-300 px-4 py-2 text-sm font-medium text-red-700 transition hover:bg-red-50"
          @click="handleDeleteProperty"
        >
          Delete Property
        </button>
      </section>
    </template>
  </div>
</template>