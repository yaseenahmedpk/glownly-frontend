<script setup>
import { ref, onMounted } from "vue";
import BusinessList from "../../components/dashboard/BusinessList.vue";
import { getBusinesses, storeBusiness, updateBusiness, deleteBusiness } from "../../services/businessService";
import { getStates } from "../../services/authService";
import { handleApiError } from '../../helpers/handleApiError'
import { showErrorAlert } from '../../helpers/swal'
import { useToast } from '../../helpers/useToast'
import Swal from 'sweetalert2'
import { useI18n } from 'vue-i18n'
import { Modal } from "bootstrap"
import { hasPermission } from '../../helpers/authHelper'
import { useAuthStore } from '../../stores/authStore'

const { t } = useI18n();
const { toast } = useToast();
const authStore = useAuthStore();
const loading = ref(false);
const businesses = ref([]);
const countries = ref([]);
const states = ref([]);
const modalObject = ref(null);
const modalTitle = ref(null);
const editingBusinessId = ref(null);

const formData = ref({
    business_name: '',
    account_type: '',
    service_type: '',
    status: '',
    address: '',
    city: '',
    country_id: '',
    state_id: '',
    timezone_id: '',
    website: '',
});

const fetchBusinesses = async () => {
    try {
        loading.value = true;
        const response = await getBusinesses();
        businesses.value = response.data.data || [];
        if (response.data.countries) countries.value = response.data.countries;
    } catch (error) {
        showErrorAlert(handleApiError(error, t));
    } finally {
        loading.value = false;
    }
};

const fetchStatesForCountry = async (countryId) => {
    if (!countryId) {
        states.value = [];
        formData.value.state_id = '';
        return;
    }
    try {
        const response = await getStates(countryId);
        states.value = response.data || [];
    } catch (error) {
        states.value = [];
    }
};

const onCountryChange = async () => {
    await fetchStatesForCountry(formData.value.country_id);
};

onMounted(() => {
    modalTitle.value = t("add");
    fetchBusinesses();
});

const openModal = async () => {
    const modalEl = document.getElementById("businessModal")
    modalObject.value = new Modal(modalEl)
    editingBusinessId.value = null;
    formData.value = {
        business_name: '',
        account_type: '',
        service_type: '',
        status: '',
        address: '',
        city: '',
        country_id: '',
        state_id: '',
        timezone_id: '',
        website: '',
    };
    states.value = [];
    modalTitle.value = t("add");
    modalObject.value.show()
};

const closeModal = () => {
    if (document.activeElement instanceof HTMLElement) {
        document.activeElement.blur()
    }
    modalObject.value.hide()
};

const saveBusiness = async () => {
    try {
        loading.value = true;
        const payload = { ...formData.value };
        payload.business_id = authStore.company?.id;
        if (editingBusinessId.value) {
            await updateBusiness(editingBusinessId.value, payload);
        } else {
            await storeBusiness(payload);
        }
        modalObject.value.hide();
        toast(t("business_created_successfully"));
        fetchBusinesses();
    } catch (error) {
        showErrorAlert(handleApiError(error, t));
    } finally {
        loading.value = false;
    }
};

const handleBusinessData = (data) => {
    const modalEl = document.getElementById("businessModal")
    modalObject.value = new Modal(modalEl)
    formData.value = {
        business_name: data.business_name || '',
        account_type_name: data.account_type_name || '',
        service_type_name: data.service_type_name || '',
        status_name: data.status_name || '',
        city: data.city || '',
        branch: data.branch || [],
    };
    editingBusinessId.value = data.id;
    modalTitle.value = t("edit");
    modalObject.value.show();
};

const handleDeleteBusiness = async (id) => {
    const result = await Swal.fire({
        title: t('are_you_sure'),
        text: t('delete_business_confirm'),
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
            await deleteBusiness(id);
            toast(t("business_deleted_successfully"));
            fetchBusinesses();
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
                        <h4 class="card-title">{{ $t('businesses') }}</h4>
                    </div>
                    <div class="header-action" v-if="hasPermission('can_add_business')">
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
                    <BusinessList :businesses="businesses" :loading="loading"
                        @businessData="handleBusinessData" @deleteBusiness="handleDeleteBusiness" />
                </div>
            </div>
        </div>
    </div>

    <div class="modal fade" id="businessModal" tabindex="-1">
        <div class="modal-dialog modal-xl">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title">{{ modalTitle }} {{ $t('business') }}</h5>
                    <button type="button" class="close" data-dismiss="modal" aria-label="Close" @click="closeModal">
                        <span aria-hidden="true">×</span>
                    </button>
                </div>
                <div class="modal-body">
                    <div class="row">
                        <div class="col-md-6 mb-3">
                            <label class="form-label">{{ $t('business_name') }}</label>
                            <input type="text" class="form-control" v-model="formData.business_name" />
                        </div>
                        <div class="col-md-6 mb-3">
                            <label class="form-label">Website</label>
                            <input type="url" class="form-control" v-model="formData.website" />
                        </div>
                        <div class="col-md-6 mb-3">
                            <label class="form-label">{{ $t('address') }}</label>
                            <input type="text" class="form-control" v-model="formData.address" />
                        </div>
                        <div class="col-md-6 mb-3">
                            <label class="form-label">{{ $t('city') }}</label>
                            <input type="text" class="form-control" v-model="formData.city" />
                        </div>
                        <div class="col-md-6 mb-3">
                            <label class="form-label">{{ $t('country') }}</label>
                            <select class="form-control" v-model="formData.country_id" @change="onCountryChange">
                                <option value="">{{ $t('select_country') || 'Select Country' }}</option>
                                <option v-for="c in countries" :key="c.id" :value="c.id">{{ c.name }}</option>
                            </select>
                        </div>
                        <div class="col-md-6 mb-3">
                            <label class="form-label">{{ $t('state') }}</label>
                            <select class="form-control" v-model="formData.state_id">
                                <option value="">{{ $t('select_state') || 'Select State' }}</option>
                                <option v-for="s in states" :key="s.id" :value="s.id">{{ s.name }}</option>
                            </select>
                        </div>
                        <div class="col-md-6 mb-3">
                            <label class="form-label">Account Type</label>
                            <select class="form-control" v-model="formData.account_type">
                                <option value="">{{ $t('select') || 'Select' }}</option>
                                <option value="1">Independent</option>
                                <option value="2">Team</option>
                            </select>
                        </div>
                        <div class="col-md-6 mb-3">
                            <label class="form-label">Service Type</label>
                            <select class="form-control" v-model="formData.service_type">
                                <option value="">{{ $t('select') || 'Select' }}</option>
                                <option value="1">Physical</option>
                                <option value="2">Mobile</option>
                            </select>
                        </div>
                        <div class="col-md-6 mb-3">
                            <label class="form-label">{{ $t('status') }}</label>
                            <select class="form-control" v-model="formData.status">
                                <option value="">{{ $t('select') || 'Select' }}</option>
                                <option value="1">Active</option>
                                <option value="0">Inactive</option>
                            </select>
                        </div>
                    </div>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" @click="closeModal">
                        {{ $t('cancel') }}
                    </button>
                    <button class="btn btn-primary" :disabled="loading" @click="saveBusiness">
                        {{ loading ? $t('saving') : $t('save') }}
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>