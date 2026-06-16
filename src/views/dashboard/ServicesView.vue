<script setup>
import { ref, onMounted, reactive } from "vue";
import Services from "../../components/dashboard/Services.vue";
import { getServices, storeService, updateService, deleteService } from "../../services/serviceService";
import { getServiceCategories } from "../../services/serviceCategoryService";
import { handleApiError } from '../../helpers/handleApiError'
import { showErrorAlert } from '../../helpers/swal'
import Swal from 'sweetalert2'
import { useI18n } from 'vue-i18n'
import { Modal } from "bootstrap"
import { hasPermission } from "../../helpers/authHelper";
import { useAuthStore } from '../../stores/authStore'


const { t } = useI18n();
const loading = ref(false);
const services = ref([]);
const serviceCategories = ref([]);
const modalObject = ref(null);
const modalTitle = ref(null);
const editingServiceId = ref(null);
const authStore = useAuthStore();

const formData = ref({
    business_id: '',
    service_category_id: '',
    name: '',
    duration_minutes: '',
    is_active: true,
    image: null,
    image_url: null
});
const selectedImage = ref(null);
const imagePreview = ref(null);

const errorsMessage = ref(null);
const imageFileInput = ref(null);

const openImageFileChooser = () => {
    imageFileInput.value?.click();
};

const onImageChange = (event) => {
    const file = event.target.files?.[0];
    if (file) {
        const allowedImageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
        if (!allowedImageTypes.includes(file.type)) {
            showErrorAlert(t('image_not_allowed') || 'Image type not allowed');
            imageFileInput.value.value = '';
            return;
        }
        const maxFileSize = 5 * 1024 * 1024;
        if (file.size > maxFileSize) {
            showErrorAlert(t('file_size_exceeded') || 'File size exceeded');
            imageFileInput.value.value = '';
            return;
        }
        selectedImage.value = file;
        imagePreview.value = URL.createObjectURL(file);
    }
};

const fetchServices = async () => {
    try {
        loading.value = true;
        const response = await getServices();
        services.value = response.data.services || response.data || [];
    } catch (error) {
        showErrorAlert(handleApiError(error, t));
    } finally {
        loading.value = false;
    }
}

const fetchServiceCategories = async () => {
    try {
        const response = await getServiceCategories();
        serviceCategories.value = response.data.service_categories || response.data || [];
    } catch (error) {
        console.error('Failed to fetch service categories');
    }
}

onMounted(() => {
    modalTitle.value = t("add");
    fetchServices();
    fetchServiceCategories();
});

const openModal = () => {
    const modalEl = document.getElementById("serviceModal")
    modalObject.value = new Modal(modalEl)
    editingServiceId.value = null;
    formData.value = {
        business_id: authStore.company?.id || authStore.companyId || '',
        service_category_id: '',
        name: '',
        duration_minutes: '',
        is_active: true,
        image: null,
        image_url: null
    };
    selectedImage.value = null;
    imagePreview.value = null;
    errorsMessage.value = null;
    modalTitle.value = t("add");
    if (imageFileInput.value) {
        imageFileInput.value.value = '';
    }
    modalObject.value.show()
}

const closeModal = () => {
    if (document.activeElement instanceof HTMLElement) {
        document.activeElement.blur()
    }
    modalObject.value.hide()
}

const saveService = async () => {
    try {
        if (formData.value.name != null) {
            loading.value = true
            const payload = new FormData();
            payload.append("business_id", formData.value.business_id);
            payload.append("service_category_id", formData.value.service_category_id);
            payload.append("name", formData.value.name);
            payload.append("duration_minutes", formData.value.duration_minutes || "");
            payload.append("is_active", formData.value.is_active || false);
            if (selectedImage.value) {
                payload.append("image", selectedImage.value);
            }
            if (editingServiceId.value) {
                await updateService(editingServiceId.value, payload);
            } else {
                await storeService(payload);
            }
            formData.value = {
                business_id: authStore.company?.id || '',
                service_category_id: '',
                name: '',
                duration_minutes: '',
                is_active: true,
                image: null,
                image_url: null
            };
            selectedImage.value = null;
            imagePreview.value = null;
            editingServiceId.value = null;
            modalObject.value.hide()
            fetchServices()
        } else {
            errorsMessage.value = "Name is required";
        }
    } catch (error) {
        showErrorAlert(handleApiError(error, t));
    } finally {
        loading.value = false
    }
}

const handleServiceData = (data) => {
    const modalEl = document.getElementById("serviceModal")
    modalObject.value = new Modal(modalEl)
    formData.value = {
        business_id: data.business_id || authStore.company?.id || '',
        service_category_id: data.service_category_id || '',
        name: data.name || '',
        duration_minutes: data.duration_minutes || '',
        is_active: data.is_active || false,
        image: null,
        image_url: data.image_url || null
    };
    selectedImage.value = null;
    imagePreview.value = data.image_url || null;
    editingServiceId.value = data.id;
    modalTitle.value = t("edit");
    modalObject.value.show();
};

const handleDeleteService = async (id) => {
    const result = await Swal.fire({
        title: t('are_you_sure'),
        text: t('delete_service_confirm'),
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: t('yes_delete'),
        cancelButtonText: t('cancel')
    });

    if (result.isConfirmed) {
        try {
            loading.value = true;
            await deleteService(id);
            fetchServices();
        } catch (error) {
            showErrorAlert(handleApiError(error, t));
        } finally {
            loading.value = false;
        }
    }
};
</script>
<template>

    <div class="row">
        <div class="col-sm-12 col-lg-12">
            <div class="card">
                <div class="card-header d-flex justify-content-between">
                    <div class="header-title">
                        <h4 class="card-title">{{ $t('services') }}</h4>
                    </div>
                    <div class="header-action" v-if="hasPermission('can_add_service')">
                        <button class="btn btn-primary" @click="openModal">
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" fill="none" viewBox="0 0 24 24"
                                stroke-width="1.5" stroke="currentColor" class="size-6">
                                <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                            </svg>
                            {{ $t('add') }}
                        </button>
                    </div>
                </div>
                <div class="card-body">
                    <Services :services="services" :loading="loading" @serviceData="handleServiceData"
                        @deleteService="handleDeleteService" />
                </div>
            </div>
        </div>

    </div>
    <div class="modal fade" id="serviceModal" tabindex="-1">
        <div class="modal-dialog">
            <div class="modal-content">

                <div class="modal-header">
                    <h5 class="modal-title">{{ modalTitle }} {{ $t('service') }}</h5>

                    <button type="button" class="close" data-dismiss="modal" aria-label="Close" @click="closeModal">
                        <span aria-hidden="true">×</span>
                    </button>
                </div>

                <div class="modal-body">

                    <div class="mb-3">
                        <label class="form-label">{{ $t('service_image') || 'Service Image' }}</label>
                        <div class="d-flex align-items-center gap-3">
                            <div class="position-relative">
                                <img v-if="imagePreview" :src="imagePreview" alt="Preview" class="avatar-preview" style="width: 80px; height: 80px; object-fit: cover; border-radius: 8px;" />
                                <img v-else-if="formData.image_url" :src="formData.image_url" alt="Service" style="width: 80px; height: 80px; object-fit: cover; border-radius: 8px;" />
                                <div v-else class="avatar-placeholder" style="width: 80px; height: 80px; display: flex; align-items: center; justify-content: center; background-color: #e9ecef; border-radius: 8px;">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" style="width: 32px; height: 32px;">
                                        <path stroke-linecap="round" stroke-linejoin="round" d="m2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-2.036-6.036a2.25 2.25 0 00-3.182 0L2.25 15.75zm14.25 0l2.038-2.038a2.25 2.25 0 013.182 0l2.038 2.038M15 15.75v-3.75m0 0l-1.5 1.5m0 0l1.5 1.5M18 18h-6" />
                                    </svg>
                                </div>
                                <div class="crm-p-image bg-primary" @click="openImageFileChooser" style="position: absolute; bottom: -5px; right: -5px; cursor: pointer; width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; border-radius: 50%;">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="18" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                    </svg>
                                    <input ref="imageFileInput" class="file-upload" type="file" accept="image/*" @change="onImageChange" :key="editingServiceId" />
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="mb-3">
                        <label class="form-label">{{ $t('business') }}</label>
                        <input type="text" class="form-control" :value="authStore.company?.name || authStore.company?.business_name || ''" disabled />
                    </div>
                    <div class="mb-3">
                        <label class="form-label">{{ $t('service_category') }} <span class="text-danger">*</span></label>
                        <select class="form-control" v-model="formData.service_category_id">
                            <option value="">{{ $t('select_category') || 'Select Category' }}</option>
                            <option v-for="cat in serviceCategories" :key="cat.id" :value="cat.id">{{ cat.name }}</option>
                        </select>
                        <span class="text-danger" v-if="errorsMessage">
                            {{ errorsMessage }}
                        </span>
                    </div>
                    <div class="mb-3">
                        <label class="form-label">{{ $t('name') }} <span class="text-danger">*</span></label>
                        <input type="text" class="form-control" v-model="formData.name" />
                    </div>
                    <div class="mb-3">
                        <label class="form-label">{{ $t('duration_minutes') }}</label>
                        <input type="number" class="form-control" v-model="formData.duration_minutes" min="1" />
                    </div>
                    <div class="mb-3">
                        <div class="form-check">
                            <input type="checkbox" class="form-check-input" id="is_active" v-model="formData.is_active" />
                            <label class="form-check-label" for="is_active">{{ $t('is_active') }}</label>
                        </div>
                    </div>

                </div>

                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal" @click="closeModal">
                        {{ $t('cancel') }}
                    </button>

                    <button class="btn btn-primary" :disabled="loading" @click="saveService">
                        {{ loading ? t('saving') : t('save') }}
                    </button>
                </div>

            </div>
        </div>
    </div>
</template>