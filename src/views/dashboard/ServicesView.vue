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
    price: '',
    duration_minutes: '',
    is_active: true
});

const errorsMessage = ref(null);

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
        business_id: authStore.company?.id || '',
        service_category_id: '',
        name: '',
        price: '',
        duration_minutes: '',
        is_active: true
    };
    errorsMessage.value = null;
    modalTitle.value = t("add");
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
            const payload = {
                business_id: formData.value.business_id,
                service_category_id: formData.value.service_category_id,
                name: formData.value.name,
                price: formData.value.price || null,
                duration_minutes: formData.value.duration_minutes || null,
                is_active: formData.value.is_active || false,
            }

            if (editingServiceId.value) {
                await updateService(editingServiceId.value, payload)
            } else {
                await storeService(payload)
            }
            formData.value = {
                business_id: authStore.company?.id || '',
                service_category_id: '',
                name: '',
                price: '',
                duration_minutes: '',
                is_active: true
            };
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
        price: data.price || '',
        duration_minutes: data.duration_minutes || '',
        is_active: data.is_active || false,
    };
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
                        <label class="form-label">{{ $t('business') }}</label>
                        <input type="text" class="form-control" :value="authStore.company?.business_name || ''" disabled />
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
                        <label class="form-label">{{ $t('price') }}</label>
                        <input type="number" class="form-control" v-model="formData.price" step="0.01" />
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