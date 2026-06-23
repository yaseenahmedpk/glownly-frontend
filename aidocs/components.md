# Components Guide

This document outlines the standards and patterns for building Vue 3 components in the BarberWebApp-frontend project.

## Component Structure

### View + Component Pattern

The project uses a **View + Component** architecture where:
- **Views** (`src/views/`) handle business logic, API calls, and state management
- **Components** (`src/components/`) handle presentation and UI interactions via events

This separation allows for:
- Cleaner code organization
- Reusable presentational components
- Easier testing and maintenance

### View Component Template

Views manage data fetching, form submission, and business logic:

```vue
<script setup>
import { ref, onMounted } from "vue";
import { useI18n } from "vue-i18n";
import { useAuthStore } from "../../stores/authStore";
import { handleApiError } from "../../helpers/handleApiError";
import { showErrorAlert, showConfirmDialog } from "../../helpers/swal";
import { useToast } from "../../helpers/useToast";
import { hasPermission } from "../../helpers/authHelper";
import ChildComponent from "../../components/dashboard/ChildComponent.vue";
import { getResource, storeResource, updateResource, deleteResource } from "../../services/resourceService";

const { t } = useI18n();
const authStore = useAuthStore();
const { toast } = useToast();

// State
const loading = ref(false);
const items = ref([]);
const formData = ref({ /* ... */ });
const modalObject = ref(null);
const editingItemId = ref(null);

// API calls from services (see axios.md)
const fetchItems = async () => {
    try {
        loading.value = true;
        const response = await getResource();
        items.value = response.data.items || [];
    } catch (error) {
        showErrorAlert(handleApiError(error, t));
    } finally {
        loading.value = false;
    }
};

// Form handlers
const saveItem = async () => {
    try {
        loading.value = true;
        const payload = { ...formData.value };
        if (editingItemId.value) {
            await updateResource(editingItemId.value, payload);
        } else {
            await storeResource(payload);
        }
        modalObject.value.hide();
        toast(t("saved_successfully"));
        fetchItems();
    } catch (error) {
        showErrorAlert(handleApiError(error, t));
    } finally {
        loading.value = false;
    }
};

// Event handlers from child components
const handleEdit = (data) => { /* ... */ };
const handleDelete = async (id) => { /* ... */ };

onMounted(() => {
    fetchItems();
});
</script>

<template>
    <div class="row">
        <div class="col-lg-12">
            <button class="btn btn-primary" @click="openModal">
                {{ $t("add") }}
            </button>
        </div>
        <div class="col-lg-12 mt-2">
            <ChildComponent :items="items" :loading="loading"
                @editItem="handleEdit"
                @deleteItem="handleDelete" />
        </div>
    </div>

    <!-- Modal -->
    <div class="modal fade" id="itemModal" tabindex="-1">
        <!-- form content -->
    </div>
</template>
```

### Presentational Component Template

Components handle UI display and emit events for user actions:

```vue
<script setup>
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { hasPermission } from '../../helpers/authHelper';

const { t } = useI18n();

// Props for data and state
defineProps({
    items: {
        type: Array,
        default: () => []
    },
    loading: Boolean,
});

// Emits for user actions
const emit = defineEmits(['editItem', 'deleteItem']);

// Event emitters
const selectItem = (item) => {
    emit('editItem', item);
};

const deleteItem = (item) => {
    emit('deleteItem', item.id);
};

// Computed headers using i18n
const headers = computed(() => [
    { text: t('id'), value: 'id', sortable: true },
    { text: t('name'), value: 'name', sortable: true },
    { text: t('action'), value: 'action', sortable: false },
]);
</script>

<template>
    <Vue3EasyDataTable :headers="headers" :items="items" :loading="loading">
        <template #item-action="item">
            <svg v-if="hasPermission('can_edit_item')"
                @click="selectItem(item)">
                <!-- edit icon -->
            </svg>
            <svg v-if="hasPermission('can_delete_item')"
                @click="deleteItem(item)">
                <!-- delete icon -->
            </svg>
        </template>
    </Vue3EasyDataTable>
</template>
```

## Imports Pattern

### Standard Imports for Views

```javascript
import { useI18n } from "vue-i18n";
import { useAuthStore } from "../../stores/authStore";
import { useToast } from "../../helpers/useToast";
import { handleApiError } from "../../helpers/handleApiError";
import { showErrorAlert } from "../../helpers/swal";
import { hasPermission } from "../../helpers/authHelper";
import { Modal } from "bootstrap";
```

### Standard Imports for Components

```javascript
import { useI18n } from "vue-i18n";
import { hasPermission } from "../../helpers/authHelper";
import Vue3EasyDataTable from "vue3-easy-data-table";
```

## Data Table Components

The project uses `vue3-easy-data-table` for listing data:

```vue
<Vue3EasyDataTable 
    :headers="headers" 
    :items="items" 
    :loading="loading" 
    :rows-per-page="10"
    :buttons-pagination="true"
    theme-color="#007bff"
    table-class-name="customize-vue-table table table-bordered">
    
    <template #item-field_name="item">
        <!-- Custom cell rendering -->
    </template>
    
    <template #item-action="item">
        <!-- Action buttons -->
    </template>
</Vue3EasyDataTable>
```

## Forms and Validation

The project uses `vee-validate` with `yup` for form validation:

```vue
<script setup>
import { Form, Field, ErrorMessage } from 'vee-validate';
import * as yup from 'yup';

// Define validation schema
const schema = yup.object({
    name: yup.string().required('Name is required'),
    email: yup.string().email('Invalid email').required('Email is required'),
});
</script>

<template>
    <Form @submit="handleSubmit" :validation-schema="schema">
        <div class="form-group">
            <label for="name">Name</label>
            <Field name="name" type="text" class="form-control" id="name" v-model="formData.name" />
            <ErrorMessage name="name" class="text-danger" />
        </div>
    </Form>
</template>
```

## Modals

Use Bootstrap modals for forms and dialogs:

```vue
<script setup>
import { Modal } from "bootstrap";
import { ref } from "vue";

const modalObject = ref(null);

const openModal = () => {
    const modalEl = document.getElementById("modalId");
    modalObject.value = new Modal(modalEl);
    modalObject.value.show();
};

const closeModal = () => {
    modalObject.value?.hide();
};
</script>

<template>
    <div class="modal fade" id="modalId" tabindex="-1">
        <div class="modal-dialog">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title">{{ modalTitle }}</h5>
                    <button type="button" class="close" @click="closeModal">×</button>
                </div>
                <div class="modal-body">
                    <!-- form content -->
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" @click="closeModal">
                        {{ $t('cancel') }}
                    </button>
                    <button class="btn btn-primary" @click="saveItem" :disabled="loading">
                        {{ loading ? $t('saving') : $t('save') }}
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>
```

## File Upload Handling

For file uploads, use FormData:

```vue
<script setup>
import { ref } from "vue";

const selectedFile = ref(null);
const imagePreview = ref(null);
const fileInput = ref(null);

const handleFileChange = (event) => {
    const file = event.target.files?.[0];
    if (file) {
        const allowedImageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
        if (!allowedImageTypes.includes(file.type)) {
            showErrorAlert(t('image_not_allowed'));
            fileInput.value.value = '';
            return;
        }
        const maxFileSize = 5 * 1024 * 1024;
        if (file.size > maxFileSize) {
            showErrorAlert(t('file_size_exceeded'));
            fileInput.value.value = '';
            return;
        }
        selectedFile.value = file;
        imagePreview.value = URL.createObjectURL(file);
    }
};
</script>

<template>
    <input ref="fileInput" type="file" accept="image/*" @change="handleFileChange" />
    <img v-if="imagePreview" :src="imagePreview" alt="Preview" />
</template>
```

## Permission Checks

Use `hasPermission` helper in templates:

```vue
<button v-if="hasPermission('can_add_item')" class="btn btn-primary" @click="openModal">
    {{ $t('add') }}
</button>

<svg v-if="hasPermission('can_edit_item')" @click="editItem(item)">
    <!-- edit icon -->
</svg>

<button :disabled="loading" @click="saveItem">
    {{ loading ? $t('saving') : $t('save') }}
</button>
```

## Internationalization (i18n)

Always use `$t()` for static text and `t()` in script:

```vue
<template>
    <h4>{{ $t('services') }}</h4>
    <label>{{ $t('name') }} <span class="text-danger">*</span></label>
</template>

<script setup>
const { t } = useI18n();
// Use t() in script for dynamic messages
const message = t('saved_successfully');
</script>
```

## Toast Notifications

Use `useToast` for success messages:

```vue
<script setup>
import { useToast } from "../../helpers/useToast";
const { toast } = useToast();

toast(t("saved_successfully"));
</script>
```

## SweetAlert2 for Confirmations

Use Swal for confirmation dialogs:

```vue
<script setup>
import Swal from 'sweetalert2';

const handleDelete = async (id) => {
    const result = await Swal.fire({
        title: t('are_you_sure'),
        text: t('delete_confirm'),
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: t('yes_delete'),
        cancelButtonText: t('cancel')
    });

    if (result.isConfirmed) {
        // Proceed with deletion
    }
};
</script>
```

## Lifecycle Hooks

Common lifecycle patterns:

```javascript
import { onMounted, onUnmounted } from "vue";

onMounted(() => {
    fetchData();
});

onUnmounted(() => {
    // Clean up listeners (Echo, event listeners, etc.)
});
```

## Props and Emits Pattern

```javascript
// Props - for receiving data
defineProps({
    items: {
        type: Array,
        default: () => []
    },
    loading: Boolean,
});

// Emits - for triggering actions
const emit = defineEmits(['editItem', 'deleteItem', 'update']);

// Emit with data
const selectItem = (item) => {
    emit('editItem', item);
};
```

## Summary Checklist for New Components

1. Create view in `src/views/` for business logic
2. Create component in `src/components/` for presentation
3. Use Composition API (`ref`, `computed`, `onMounted`)
4. Import API services from `../../services/`
5. Use `handleApiError` for error handling
6. Use `showErrorAlert` and `useToast` for notifications
7. Use `hasPermission` for permission checks
8. Use i18n `$t()` and `t()` for all text
9. Use Vue3EasyDataTable for listing data
10. Use Bootstrap modals for forms