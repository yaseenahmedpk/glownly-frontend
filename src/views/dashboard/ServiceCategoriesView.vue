<script setup>
import { ref, onMounted, reactive } from "vue";
import ServiceCategories from "../../components/dashboard/ServiceCategories.vue";
import { getServiceCategories } from "../../services/serviceCategoryService";
import { storeServiceCategory } from "../../services/serviceCategoryService";
import { updateServiceCategory } from "../../services/serviceCategoryService";
import { deleteServiceCategory } from "../../services/serviceCategoryService";
import { handleApiError } from '../../helpers/handleApiError'
import { showErrorAlert } from '../../helpers/swal'
import Swal from 'sweetalert2'
import { useI18n } from 'vue-i18n'
import { Modal } from "bootstrap"
import { hasPermission } from "../../helpers/authHelper";


const { t } = useI18n();
const loading = ref(false);
const serviceCategories = ref([]);
const modalObject = ref(null);
const categoryName = ref(null);
const categoryDescription = ref(null);
const errorsMessage = ref(null);
const editingServiceCategoryId = ref(null);
const modalTitle = ref(null);

const fetchServiceCategories = async () => {
    try {
        loading.value = true;
        const response = await getServiceCategories();
        serviceCategories.value = response.data.service_categories;
    } catch (error) {
        showErrorAlert(handleApiError(error, t));
    } finally {
        loading.value = false;
    }
}
onMounted(() => {
    modalTitle.value = t("add");
    fetchServiceCategories();
});
const openModal = () => {
    const modalEl = document.getElementById("serviceCategoryModal")
    modalObject.value = new Modal(modalEl)
    editingServiceCategoryId.value = null;
    categoryName.value = null;
    categoryDescription.value = null;
    modalTitle.value = t("add");
    modalObject.value.show()
}
const closeModal = () => {
    if (document.activeElement instanceof HTMLElement) {
        document.activeElement.blur()
    }
    modalObject.value.hide()
}
const saveServiceCategory = async () => {
    try {
        if (categoryName.value != null) {
            loading.value = true
            const payload = {
                name: categoryName.value,
                description: categoryDescription.value,
            }

            if (editingServiceCategoryId.value) {
                await updateServiceCategory(editingServiceCategoryId.value, payload)
            } else {
                await storeServiceCategory(payload)
            }
            categoryName.value = "";
            categoryDescription.value = "";
            editingServiceCategoryId.value = null;
            modalObject.value.hide()
            fetchServiceCategories()
        } else {
            errorsMessage.value = "Name is required";
        }
    } catch (error) {
        showErrorAlert(handleApiError(error, t));
    } finally {
        loading.value = false
    }
}
const handleServiceCategoryData = (data) => {
    const modalEl = document.getElementById("serviceCategoryModal")
    modalObject.value = new Modal(modalEl)
    categoryName.value = data.name;
    categoryDescription.value = data.description;
    editingServiceCategoryId.value = data.id;
    modalTitle.value = t("edit");
    modalObject.value.show();
};
const handleDeleteServiceCategory = async (id) => {
    const result = await Swal.fire({
        title: t('are_you_sure'),
        text: t('delete_service_category_confirm'),
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
            await deleteServiceCategory(id);
            fetchServiceCategories();
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
                        <h4 class="card-title">{{ $t('service_categories') }}</h4>
                    </div>
                    <div class="header-action" v-if="hasPermission('can_add_service_category')">
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
                    <ServiceCategories :serviceCategories="serviceCategories" :loading="loading" @serviceCategoryData="handleServiceCategoryData"
                        @deleteServiceCategory="handleDeleteServiceCategory" />
                </div>
            </div>
        </div>

    </div>
    <div class="modal fade" id="serviceCategoryModal" tabindex="-1">
        <div class="modal-dialog">
            <div class="modal-content">

                <div class="modal-header">
                    <h5 class="modal-title">{{ modalTitle }} {{ $t('service_category') }}</h5>

                    <button type="button" class="close" data-dismiss="modal" aria-label="Close" @click="closeModal">
                        <span aria-hidden="true">×</span>
                    </button>
                </div>

                <div class="modal-body">

                    <div class="mb-3">
                        <label class="form-label">{{ $t('name') }}</label>
                        <input type="text" class="form-control" v-model="categoryName" />
                        <span class="text-danger" v-if="errorsMessage">
                            {{ errorsMessage }}
                        </span>
                    </div>
                    <div class="mb-3">
                        <label class="form-label">{{ $t('description') }}</label>
                        <textarea class="form-control" v-model="categoryDescription" rows="3"></textarea>
                    </div>

                </div>

                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal" @click="closeModal">
                        {{ $t('cancel') }}
                    </button>

                    <button class="btn btn-primary" :disabled="loading" @click="saveServiceCategory">
                        {{ loading ? t('saving') : t('save') }}
                    </button>
                </div>

            </div>
        </div>
    </div>
</template>