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
const viewingBusiness = ref(null);
const viewModalObject = ref(null);

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

const handleViewBusiness = (business) => {
    viewingBusiness.value = business;
    const modalEl = document.getElementById("viewBusinessModal");
    viewModalObject.value = new Modal(modalEl);
    viewModalObject.value.show();
};

const closeViewModal = () => {
    if (document.activeElement instanceof HTMLElement) {
        document.activeElement.blur();
    }
    viewModalObject.value.hide();
    viewingBusiness.value = null;
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
                @businessData="handleBusinessData" @deleteBusiness="handleDeleteBusiness" @statusUpdated="fetchBusinesses" @viewBusiness="handleViewBusiness" />
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

    <div class="modal fade" id="viewBusinessModal" tabindex="-1">
        <div class="modal-dialog modal-xl">
            <div class="modal-content" style="border-radius: 16px; border: 1px solid #E5E7EB; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);">
                <div class="modal-header border-0 pb-0" style="background: linear-gradient(135deg, #9A77BC 0%, #8A69AC 100%); border-radius: 16px 16px 0 0;">
                    <div class="d-flex align-items-center w-100">
                        <div v-if="viewingBusiness?.business_logo_url" class="mr-3">
                            <img :src="viewingBusiness.business_logo_url" alt="Business Logo" class="rounded" style="width: 48px; height: 48px; object-fit: cover; border: 2px solid rgba(255,255,255,0.3);" />
                        </div>
                        <div v-else class="mr-3" style="width: 48px; height: 48px; border-radius: 8px; background: rgba(255,255,255,0.2); display: flex; align-items: center; justify-content: center;">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="white" stroke-width="1.5">
                                <path stroke-linecap="round" stroke-linejoin="round" d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21" />
                            </svg>
                        </div>
                        <div class="flex-grow-1">
                            <h5 class="modal-title text-white mb-0 font-weight-bold" style="font-size: 18px;">{{ viewingBusiness?.business_name || '-' }}</h5>
                            <p class="text-white-50 mb-0" style="font-size: 13px;">{{ $t('view_business') }}</p>
                        </div>
                        <button type="button" class="close text-white" data-dismiss="modal" aria-label="Close" @click="closeViewModal" style="opacity: 0.8; font-size: 28px; line-height: 1;">
                            <span aria-hidden="true" style="text-shadow: 0 1px 2px rgba(0,0,0,0.2);">&times;</span>
                        </button>
                    </div>
                </div>
                <div class="modal-body p-4" v-if="viewingBusiness" style="background-color: #F5F6FA;">
                    <!-- Quick Stats Row -->
                    <div class="row mb-4">
                        <div class="col-md-4 mb-3">
                            <div class="card border-0 shadow-sm h-100" style="border-radius: 12px; border-left: 4px solid #9A77BC !important;">
                                <div class="card-body p-3">
                                    <div class="d-flex align-items-center">
                                        <div style="width: 40px; height: 40px; border-radius: 10px; background: rgba(154, 119, 188, 0.1); display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="#9A77BC" stroke-width="2">
                                                <path stroke-linecap="round" stroke-linejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                                                <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                                            </svg>
                                        </div>
                                        <div class="ml-3">
                                            <div class="text-muted" style="font-size: 12px; font-weight: 500;">{{ $t('city') }}</div>
                                            <div class="font-weight-bold" style="font-size: 14px; color: #1A1A2E;">{{ viewingBusiness.city || '-' }}</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="col-md-4 mb-3">
                            <div class="card border-0 shadow-sm h-100" style="border-radius: 12px; border-left: 4px solid #00B4D8 !important;">
                                <div class="card-body p-3">
                                    <div class="d-flex align-items-center">
                                        <div style="width: 40px; height: 40px; border-radius: 10px; background: rgba(0, 180, 216, 0.1); display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="#00B4D8" stroke-width="2">
                                                <path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21a3.745 3.745 0 01-3.068-1.593 3.746 3.745 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.746 3.745 0 013.296-1.043A3.746 3.745 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.746 3.745 0 013.296 1.043 3.746 3.745 0 011.043 3.296A3.745 3.745 0 0121 12z" />
                                            </svg>
                                        </div>
                                        <div class="ml-3">
                                            <div class="text-muted" style="font-size: 12px; font-weight: 500;">{{ $t('status') }}</div>
                                            <div class="font-weight-bold" style="font-size: 14px;">
                                                <span :class="viewingBusiness.status === 1 ? 'text-success' : 'text-danger'">
                                                    {{ viewingBusiness.status_name || '-' }}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="col-md-4 mb-3">
                            <div class="card border-0 shadow-sm h-100" style="border-radius: 12px; border-left: 4px solid #2ECC71 !important;">
                                <div class="card-body p-3">
                                    <div class="d-flex align-items-center">
                                        <div style="width: 40px; height: 40px; border-radius: 10px; background: rgba(46, 204, 113, 0.1); display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="#2ECC71" stroke-width="2">
                                                <path stroke-linecap="round" stroke-linejoin="round" d="M2.25 18 9 11.25l4.306 4.306a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0-5.94-2.281m5.94 2.28-2.28 5.941" />
                                            </svg>
                                        </div>
                                        <div class="ml-3">
                                            <div class="text-muted" style="font-size: 12px; font-weight: 500;">{{ $t('active_package') }}</div>
                                            <div class="font-weight-bold" style="font-size: 14px; color: #1A1A2E;">{{ viewingBusiness.subscription?.package?.name || '-' }}</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Business Details Card -->
                    <div class="card border-0 shadow-sm mb-4" style="border-radius: 12px;">
                        <div class="card-header bg-white border-0 py-3" style="border-bottom: 1px solid #E5E7EB;">
                            <div class="d-flex align-items-center">
                                <div style="width: 32px; height: 32px; border-radius: 8px; background: rgba(154, 119, 188, 0.1); display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="#9A77BC" stroke-width="2">
                                        <path stroke-linecap="round" stroke-linejoin="round" d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21" />
                                    </svg>
                                </div>
                                <h6 class="mb-0 ml-2 font-weight-bold" style="color: #1A1A2E; font-size: 15px;">{{ $t('business_details') }}</h6>
                            </div>
                        </div>
                        <div class="card-body p-4">
                            <div class="row">
                                <div class="col-md-6 col-lg-4 mb-3">
                                    <div class="d-flex align-items-start">
                                        <div class="mr-3" style="width: 20px; flex-shrink: 0; text-align: center; margin-top: 2px;">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="#9A77BC" stroke-width="2">
                                                <path stroke-linecap="round" stroke-linejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                                                <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                                            </svg>
                                        </div>
                                        <div>
                                            <div class="text-muted" style="font-size: 12px; font-weight: 500;">{{ $t('address') }}</div>
                                            <div class="font-weight-bold" style="font-size: 14px; color: #1A1A2E;">{{ viewingBusiness.address || '-' }}</div>
                                        </div>
                                    </div>
                                </div>
                                <div class="col-md-6 col-lg-4 mb-3">
                                    <div class="d-flex align-items-start">
                                        <div class="mr-3" style="width: 20px; flex-shrink: 0; text-align: center; margin-top: 2px;">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="#9A77BC" stroke-width="2">
                                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418" />
                                            </svg>
                                        </div>
                                        <div>
                                            <div class="text-muted" style="font-size: 12px; font-weight: 500;">{{ $t('website') }}</div>
                                            <div class="font-weight-bold" style="font-size: 14px; color: #1A1A2E;">
                                                <a v-if="viewingBusiness.website" :href="viewingBusiness.website" target="_blank" class="text-decoration-none" style="color: #9A77BC;">{{ viewingBusiness.website }}</a>
                                                <span v-else>-</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div class="col-md-6 col-lg-4 mb-3">
                                    <div class="d-flex align-items-start">
                                        <div class="mr-3" style="width: 20px; flex-shrink: 0; text-align: center; margin-top: 2px;">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="#9A77BC" stroke-width="2">
                                                <path stroke-linecap="round" stroke-linejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0Z" />
                                            </svg>
                                        </div>
                                        <div>
                                            <div class="text-muted" style="font-size: 12px; font-weight: 500;">{{ $t('timezone') }}</div>
                                            <div class="font-weight-bold" style="font-size: 14px; color: #1A1A2E;">{{ viewingBusiness.timezone_id || '-' }}</div>
                                        </div>
                                    </div>
                                </div>
                                <div class="col-md-6 col-lg-4 mb-3">
                                    <div class="d-flex align-items-start">
                                        <div class="mr-3" style="width: 20px; flex-shrink: 0; text-align: center; margin-top: 2px;">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="#9A77BC" stroke-width="2">
                                                <path stroke-linecap="round" stroke-linejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                                                <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                                            </svg>
                                        </div>
                                        <div>
                                            <div class="text-muted" style="font-size: 12px; font-weight: 500;">{{ $t('state') }}</div>
                                            <div class="font-weight-bold" style="font-size: 14px; color: #1A1A2E;">{{ viewingBusiness.state_id || '-' }}</div>
                                        </div>
                                    </div>
                                </div>
                                <div class="col-md-6 col-lg-4 mb-3">
                                    <div class="d-flex align-items-start">
                                        <div class="mr-3" style="width: 20px; flex-shrink: 0; text-align: center; margin-top: 2px;">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="#9A77BC" stroke-width="2">
                                                <path stroke-linecap="round" stroke-linejoin="round" d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21" />
                                            </svg>
                                        </div>
                                        <div>
                                            <div class="text-muted" style="font-size: 12px; font-weight: 500;">{{ $t('country') }}</div>
                                            <div class="font-weight-bold" style="font-size: 14px; color: #1A1A2E;">{{ viewingBusiness.country_id || '-' }}</div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <!-- Badges Row -->
                            <div class="row mt-2">
                                <div class="col-12">
                                    <div class="d-flex flex-wrap align-items-center gap-2">
                                        <div>
                                            <span class="text-muted" style="font-size: 12px; font-weight: 500;">{{ $t('account_type') }}</span>
                                            <div>
                                                <span class="badge px-3 py-2" style="background: rgba(154, 119, 188, 0.1); color: #9A77BC; border-radius: 6px; font-size: 13px; font-weight: 500;">{{ viewingBusiness.account_type_name || 'N/A' }}</span>
                                            </div>
                                        </div>
                                        <div>
                                            <span class="text-muted" style="font-size: 12px; font-weight: 500;">{{ $t('service_type') }}</span>
                                            <div>
                                                <span class="badge px-3 py-2" style="background: rgba(0, 180, 216, 0.1); color: #00B4D8; border-radius: 6px; font-size: 13px; font-weight: 500;">{{ viewingBusiness.service_type_name || 'N/A' }}</span>
                                            </div>
                                        </div>
                                        <div>
                                            <span class="text-muted" style="font-size: 12px; font-weight: 500;">{{ $t('status') }}</span>
                                            <div>
                                                <span class="badge px-3 py-2" :style="viewingBusiness.status === 1 ? 'background: rgba(46, 204, 113, 0.1); color: #2ECC71; border-radius: 6px; font-size: 13px; font-weight: 500;' : 'background: rgba(231, 76, 60, 0.1); color: #E74C3C; border-radius: 6px; font-size: 13px; font-weight: 500;'">{{ viewingBusiness.status_name || 'N/A' }}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <!-- Branches & Categories -->
                            <div class="row mt-4">
                                <div class="col-md-6 mb-3" v-if="viewingBusiness.branch && viewingBusiness.branch.length">
                                    <div class="text-muted mb-2" style="font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">{{ $t('branches') }}</div>
                                    <div class="d-flex flex-wrap gap-2">
                                        <span v-for="b in viewingBusiness.branch" :key="b.id" class="badge px-3 py-2" style="background: #FFFFFF; color: #1A1A2E; border: 1px solid #E5E7EB; border-radius: 6px; font-size: 13px; font-weight: 500;">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" style="margin-right: 4px; vertical-align: -1px;">
                                                <path stroke-linecap="round" stroke-linejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                                                <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                                            </svg>
                                            {{ b.name }}
                                        </span>
                                    </div>
                                </div>
                                <div class="col-md-6 mb-3" v-if="viewingBusiness.categories && viewingBusiness.categories.length">
                                    <div class="text-muted mb-2" style="font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">{{ $t('service_categories') }}</div>
                                    <div class="d-flex flex-wrap gap-2">
                                        <span v-for="cat in viewingBusiness.categories" :key="cat.id" class="badge px-3 py-2" style="background: #FFFFFF; color: #1A1A2E; border: 1px solid #E5E7EB; border-radius: 6px; font-size: 13px; font-weight: 500;">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" style="margin-right: 4px; vertical-align: -1px;">
                                                <path stroke-linecap="round" stroke-linejoin="round" d="M9.568 3H5.25A2.25 2.25 0 003 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 005.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 009.568 3z" />
                                                <path stroke-linecap="round" stroke-linejoin="round" d="M6 6h.008v.008H6V6z" />
                                            </svg>
                                            {{ cat.name }}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Subscription Card -->
                    <div class="card border-0 shadow-sm mb-4" v-if="viewingBusiness.subscription" style="border-radius: 12px; border: 1px solid #E5E7EB;">
                        <div class="card-header bg-white border-0 py-3" style="border-bottom: 1px solid #E5E7EB;">
                            <div class="d-flex align-items-center">
                                <div style="width: 32px; height: 32px; border-radius: 8px; background: rgba(0, 180, 216, 0.1); display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="#00B4D8" stroke-width="2">
                                        <path stroke-linecap="round" stroke-linejoin="round" d="M2.25 18 9 11.25l4.306 4.306a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0-5.94-2.281m5.94 2.28-2.28 5.941" />
                                    </svg>
                                </div>
                                <h6 class="mb-0 ml-2 font-weight-bold" style="color: #1A1A2E; font-size: 15px;">{{ $t('subscription_details') }}</h6>
                            </div>
                        </div>
                        <div class="card-body p-4">
                            <div class="row">
                                <div class="col-md-6 col-lg-4 mb-3">
                                    <div class="p-3 rounded" style="background: #F5F6FA; border-radius: 8px;">
                                        <div class="text-muted mb-1" style="font-size: 12px; font-weight: 500;">{{ $t('package_name') }}</div>
                                        <div class="font-weight-bold" style="font-size: 14px; color: #1A1A2E;">{{ viewingBusiness.subscription.package?.name || '-' }}</div>
                                    </div>
                                </div>
                                <div class="col-md-6 col-lg-4 mb-3">
                                    <div class="p-3 rounded" style="background: #F5F6FA; border-radius: 8px;">
                                        <div class="text-muted mb-1" style="font-size: 12px; font-weight: 500;">{{ $t('subscription_status') }}</div>
                                        <div class="font-weight-bold" style="font-size: 14px; text-transform: capitalize;">{{ viewingBusiness.subscription.status || '-' }}</div>
                                    </div>
                                </div>
                                <div class="col-md-6 col-lg-4 mb-3">
                                    <div class="p-3 rounded" style="background: #F5F6FA; border-radius: 8px;">
                                        <div class="text-muted mb-1" style="font-size: 12px; font-weight: 500;">{{ $t('subscription_amount') }}</div>
                                        <div class="font-weight-bold" style="font-size: 14px; color: #1A1A2E;">{{ viewingBusiness.subscription.amount || '-' }}</div>
                                    </div>
                                </div>
                                <div class="col-md-6 col-lg-4 mb-3">
                                    <div class="p-3 rounded" style="background: #F5F6FA; border-radius: 8px;">
                                        <div class="text-muted mb-1" style="font-size: 12px; font-weight: 500;">{{ $t('start_date') }}</div>
                                        <div class="font-weight-bold" style="font-size: 14px; color: #1A1A2E;">{{ viewingBusiness.subscription.start_date || '-' }}</div>
                                    </div>
                                </div>
                                <div class="col-md-6 col-lg-4 mb-3">
                                    <div class="p-3 rounded" style="background: #F5F6FA; border-radius: 8px;">
                                        <div class="text-muted mb-1" style="font-size: 12px; font-weight: 500;">{{ $t('end_date') }}</div>
                                        <div class="font-weight-bold" style="font-size: 14px; color: #1A1A2E;">{{ viewingBusiness.subscription.end_date || '-' }}</div>
                                    </div>
                                </div>
                                <div class="col-md-6 col-lg-4 mb-3">
                                    <div class="p-3 rounded" style="background: #F5F6FA; border-radius: 8px;">
                                        <div class="text-muted mb-1" style="font-size: 12px; font-weight: 500;">{{ $t('payment_status') }}</div>
                                        <div class="font-weight-bold" style="font-size: 14px; text-transform: capitalize;">{{ viewingBusiness.subscription.payment_status || '-' }}</div>
                                    </div>
                                </div>
                            </div>

                            <!-- Features -->
                            <div class="row mt-2" v-if="viewingBusiness.subscription?.package?.features && viewingBusiness.subscription.package.features.length">
                                <div class="col-12">
                                    <div class="text-muted mb-3" style="font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">{{ $t('features') }}</div>
                                    <div class="row">
                                        <div class="col-md-6 col-lg-4 mb-2" v-for="feature in viewingBusiness.subscription.package.features" :key="feature.id">
                                            <div class="d-flex align-items-center p-2 rounded" style="background: #FFFFFF; border: 1px solid #E5E7EB; border-radius: 8px;">
                                                <div style="width: 24px; height: 24px; border-radius: 6px; background: rgba(46, 204, 113, 0.1); display: flex; align-items: center; justify-content: center; flex-shrink: 0; margin-right: 10px;">
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="#2ECC71" stroke-width="3">
                                                        <path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                                                    </svg>
                                                </div>
                                                <div class="flex-grow-1">
                                                    <div class="font-weight-bold" style="font-size: 13px; color: #1A1A2E;">{{ feature.name }}</div>
                                                </div>
                                                <span class="badge px-2 py-1" style="background: rgba(154, 119, 188, 0.1); color: #9A77BC; border-radius: 4px; font-size: 12px; font-weight: 600;">{{ feature.pivot?.value || '-' }}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="modal-footer border-0 bg-white" style="border-radius: 0 0 16px 16px; padding: 16px 24px;">
                    <button type="button" class="btn btn-secondary" @click="closeViewModal" style="border-radius: 8px; padding: 10px 20px; font-weight: 500;">
                        {{ $t('close') }}
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>