<script setup>
import { ref, onMounted, computed, watch, nextTick } from "vue";
import { useRouter, useRoute } from "vue-router";
import {
    getCoupon,
    storeCoupon,
    updateCoupon,
} from "../../services/couponService";
import { getBranches } from "../../services/branchService";
import { getBusinesses } from "../../services/businessService";
import { handleApiError } from '../../helpers/handleApiError'
import { showErrorAlert } from '../../helpers/swal'
import { useToast } from '../../helpers/useToast'
import { useI18n } from 'vue-i18n'
import { hasPermission } from "../../helpers/authHelper";
import { useAuthStore } from '../../stores/authStore'

const { t } = useI18n();
const { toast } = useToast();
const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();
const loading = ref(false);
const isEditing = computed(() => !!route.params.id);
const pageTitle = computed(() => isEditing.value ? t('edit_coupon') : t('add_coupon'));

const formData = ref({
    title: '',
    description: '',
    code: '',
    coupon_type: 'general',
    discount_type: 'percentage',
    discount_value: '',
    max_discount_amount: '',
    minimum_purchase: '',
    availability_type: 'owner_all_branches',
    branch_ids: [],
    business_ids: [],
    eligibility_type: 'all',
    validity_type: 'fixed_dates',
    start_date: '',
    start_time: '00:00',
    expiry_date: '',
    expiry_time: '23:59',
    days_after_claim: 30,
    usage_limit: '',
    uses_per_customer: 1,
    status: 'draft',
    is_platform_coupon: false,
});

const branches = ref([]);
const businesses = ref([]);
const isRemakenAdmin = computed(() => {
    return authStore.user?.is_super_admin === true || authStore.user?.roles?.some(role => role.name === 'REMAKEN Admin' || role.name === 'Super Admin');
});

const isPlatformCoupon = computed(() => formData.value.is_platform_coupon);

const couponTypeOptions = [
    { value: 'general', label: t('coupon_types.general') },
    { value: 'welcome', label: t('coupon_types.welcome') },
    { value: 'campaign', label: t('coupon_types.campaign') },
    { value: 'promotional', label: t('coupon_types.promotional') },
];

const discountTypeOptions = [
    { value: 'percentage', label: t('discount_types.percentage') },
    { value: 'fixed_amount', label: t('discount_types.fixed_amount') },
];

const validityTypeOptions = [
    { value: 'fixed_dates', label: t('validity_types.fixed_dates') },
    { value: 'days_after_claim', label: t('validity_types.days_after_claim') },
];

const eligibilityOptions = [
    { value: 'all', label: t('eligibility_types.all') },
    { value: 'new_customer', label: t('eligibility_types.new_customer') },
    { value: 'existing_customer', label: t('eligibility_types.existing_customer') },
    { value: 'selected_customers', label: t('eligibility_types.selected_customers') },
];

watch(() => formData.value.coupon_type, (newType) => {
    if (newType === 'welcome') {
        formData.value.eligibility_type = 'new_customer';
        formData.value.uses_per_customer = 1;
    }
});

watch(() => formData.value.availability_type, (newType) => {
    if (newType === 'owner_all_branches') {
        formData.value.branch_ids = [];
    } else if (newType === 'all_businesses') {
        formData.value.business_ids = [];
    }
});

watch(() => route.params.id, (newId) => {
    if (newId && isEditing.value) {
        fetchCoupon(newId);
    }
});

const fetchBranches = async () => {
    try {
        const companyId = authStore.company?.id;
        if (!companyId) return;
        const response = await getBranches(companyId);
        branches.value = response.data.branches || response.data || [];
    } catch (error) {
        branches.value = [];
    }
};

const fetchBusinesses = async () => {
    try {
        const response = await getBusinesses();
        businesses.value = response.data.data || response.data || [];
    } catch (error) {
        businesses.value = [];
    }
};

const fetchCoupon = async (id) => {
    try {
        loading.value = true;
        const response = await getCoupon(id);
        const raw = Array.isArray(response.data)
            ? response.data[0]
            : (response.data.data ? response.data.data[0] : response.data);
        const data = raw || {};
        formData.value = {
            title: data.title || '',
            description: data.description || '',
            code: data.code || data.coupon_code || '',
            coupon_type: data.coupon_type || 'general',
            discount_type: data.discount_type || 'percentage',
            discount_value: data.discount_value || '',
            max_discount_amount: data.max_discount_amount || data.maximum_discount_amount || '',
            minimum_purchase: data.minimum_purchase || data.minimum_purchase_amount || '',
            availability_type: data.availability_type || 'owner_all_branches',
            branch_ids: data.branch_ids || [],
            business_ids: data.business_ids || [],
            eligibility_type: data.eligibility_type || 'all',
            validity_type: data.validity_type || 'fixed_dates',
            start_date: data.starts_at ? data.starts_at.slice(0, 10) : '',
            start_time: data.starts_at ? data.starts_at.slice(11, 16) : '00:00',
            expiry_date: data.expires_at ? data.expires_at.slice(0, 10) : '',
            expiry_time: data.expires_at ? data.expires_at.slice(11, 16) : '23:59',
            days_after_claim: data.days_after_claim || data.validity_days || 30,
            usage_limit: data.usage_limit || '',
            uses_per_customer: data.uses_per_customer || data.usage_limit_per_customer || 1,
            status: data.status || 'draft',
            is_platform_coupon: data.is_platform_coupon || false,
        };
    } catch (error) {
        showErrorAlert(handleApiError(error, t));
    } finally {
        loading.value = false;
    }
};

const validateForm = () => {
    if (!formData.value.title.trim()) {
        showErrorAlert([t('enter_coupon_title') || 'Please enter coupon title']);
        return false;
    }
    if (!formData.value.coupon_type) {
        showErrorAlert([t('select_coupon_type') || 'Please select coupon type']);
        return false;
    }
    if (!formData.value.discount_type) {
        showErrorAlert([t('select_discount_type') || 'Please select discount type']);
        return false;
    }
    if (!formData.value.discount_value || formData.value.discount_value <= 0) {
        showErrorAlert([t('enter_discount_value') || 'Please enter a valid discount value']);
        return false;
    }
    if (formData.value.validity_type === 'fixed_dates') {
        if (!formData.value.start_date || !formData.value.expiry_date) {
            showErrorAlert(['Please select start and expiry dates']);
            return false;
        }
    }
    if (formData.value.availability_type === 'selected_branches' && formData.value.branch_ids.length === 0) {
        showErrorAlert([t('select_branches') || 'Please select at least one branch']);
        return false;
    }
    if (formData.value.availability_type === 'selected_businesses' && formData.value.business_ids.length === 0) {
        showErrorAlert([t('select_customers') || 'Please select at least one business']);
        return false;
    }
    return true;
};

const saveCoupon = async () => {
    if (!validateForm()) return;

    try {
        loading.value = true;
        const payload = { ...formData.value };

        if (payload.discount_value) {
            payload.discount_value = parseFloat(payload.discount_value);
        }
        if (payload.max_discount_amount) {
            payload.max_discount_amount = parseFloat(payload.max_discount_amount);
        }
        if (payload.minimum_purchase) {
            payload.minimum_purchase = parseFloat(payload.minimum_purchase);
        }
        if (payload.usage_limit) {
            payload.usage_limit = parseInt(payload.usage_limit);
        } else {
            payload.usage_limit = null;
        }
        payload.usage_limit_per_customer = parseInt(payload.uses_per_customer);
        delete payload.uses_per_customer;
        payload.days_after_claim = parseInt(payload.days_after_claim);
        payload.business_id = authStore.company?.id;

        if (payload.validity_type === 'fixed_dates') {
            payload.start_date = `${payload.start_date}T${payload.start_time || '00:00'}:00`;
            payload.expiry_date = `${payload.expiry_date}T${payload.expiry_time || '23:59'}:00`;
        }

        if (isEditing.value) {
            await updateCoupon(route.params.id, payload);
            toast(t('coupon_updated_successfully'));
        } else {
            await storeCoupon(payload);
            toast(t('coupon_created_successfully'));
        }
        router.push('/coupons');
    } catch (error) {
        showErrorAlert(handleApiError(error, t));
    } finally {
        loading.value = false;
    }
};

onMounted(async () => {
    await fetchBranches();
    if (isRemakenAdmin.value) {
        await fetchBusinesses();
    }
    if (isEditing.value) {
        await fetchCoupon(route.params.id);
    }
});
</script>

<template>
    <div class="coupon-create-view">
        <div v-if="loading" class="coupon-loading-overlay">
            <div class="spinner-border text-primary" role="status"></div>
            <p class="mt-2 text-muted">{{ $t('loading') || 'Loading...' }}</p>
        </div>
        <div class="row align-items-center mb-4">
            <div class="col-lg-6 col-md-6">
                <h3 class="page-title">{{ pageTitle }}</h3>
            </div>
            <div class="col-lg-6 col-md-6 d-flex justify-content-end">
                <button class="btn btn-secondary btn-back" @click="router.push('/coupons')">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" fill="none" viewBox="0 0 24 24" stroke-width="1.5"
                        stroke="currentColor" class="size-6">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
                    </svg>
                    {{ $t('back_to_coupons') }}
                </button>
            </div>
        </div>

        <div class="row">
            <div class="col-lg-8 mx-auto">
                <div class="card border-0 shadow-sm" style="border-radius: 16px;">
                    <div class="card-body p-4">
                        <form @submit.prevent="saveCoupon">
                            <!-- Basic Information Section -->
                            <div class="form-section">
                                <div class="section-header">
                                    <div class="section-icon">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="18" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                                            <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
                                        </svg>
                                    </div>
                                    <h6 class="section-title">{{ $t('basic_information') || 'Basic Information' }}</h6>
                                </div>
                                <div class="section-body">
                                    <div class="row g-3">
                                        <div class="col-md-6">
                                            <label class="form-label">{{ $t('coupon_title') }} <span class="required">*</span></label>
                                            <input type="text" class="form-control" v-model="formData.title" :placeholder="$t('enter_coupon_title')" :disabled="isEditing && isPlatformCoupon && !isRemakenAdmin" />
                                        </div>
                                        <div class="col-md-6">
                                            <label class="form-label">{{ $t('coupon_code') }}</label>
                                            <input type="text" class="form-control" v-model="formData.code" :placeholder="$t('enter_coupon_code')" :disabled="isEditing && isPlatformCoupon && !isRemakenAdmin" />
                                            <small class="text-muted">{{ $t('coupon_code_helper') }}</small>
                                        </div>
                                        <div class="col-md-6">
                                            <label class="form-label">{{ $t('coupon_type') }} <span class="required">*</span></label>
                                            <select class="form-select" v-model="formData.coupon_type" :disabled="isEditing && isPlatformCoupon && !isRemakenAdmin">
                                                <option v-for="opt in couponTypeOptions" :key="opt.value" :value="opt.value">{{ opt.label }}</option>
                                            </select>
                                        </div>
                                        <div class="col-md-6">
                                            <label class="form-label">{{ $t('coupon_status') }} <span class="required">*</span></label>
                                            <select class="form-select" v-model="formData.status" :disabled="isEditing && isPlatformCoupon && !isRemakenAdmin">
                                                <option value="draft">{{ $t('status_draft') }}</option>
                                                <option value="active">{{ $t('status_active') }}</option>
                                                <option value="paused">{{ $t('status_paused') }}</option>
                                                <option value="expired">{{ $t('status_expired') }}</option>
                                                <option value="cancelled">{{ $t('status_cancelled') }}</option>
                                            </select>
                                        </div>
                                        <div class="col-12">
                                            <label class="form-label">{{ $t('description') }}</label>
                                            <textarea class="form-control" v-model="formData.description" rows="3" :placeholder="$t('enter_description')" :disabled="isEditing && isPlatformCoupon && !isRemakenAdmin"></textarea>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <!-- Discount Section -->
                            <div class="form-section">
                                <div class="section-header">
                                    <div class="section-icon">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="18" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                                            <path stroke-linecap="round" stroke-linejoin="round" d="M2.25 18 9 11.25l4.306 4.306a11.95 11.95 0 0 1 5.814-5.519l2.74-1.22m0 0-5.94-2.281m5.94 2.28-2.28 5.941" />
                                        </svg>
                                    </div>
                                    <h6 class="section-title">{{ $t('discount_information') || 'Discount Information' }}</h6>
                                </div>
                                <div class="section-body">
                                    <div class="row g-3">
                                        <div class="col-md-6">
                                            <label class="form-label">{{ $t('discount_type') }} <span class="required">*</span></label>
                                            <select class="form-select" v-model="formData.discount_type" :disabled="isEditing && isPlatformCoupon && !isRemakenAdmin">
                                                <option v-for="opt in discountTypeOptions" :key="opt.value" :value="opt.value">{{ opt.label }}</option>
                                            </select>
                                        </div>
                                        <div class="col-md-6">
                                            <label class="form-label">{{ $t('discount_value') }} <span class="required">*</span></label>
                                            <input type="number" class="form-control" v-model="formData.discount_value" min="0" step="0.01" :placeholder="$t('enter_discount_value')" :disabled="isEditing && isPlatformCoupon && !isRemakenAdmin" />
                                        </div>
                                        <div class="col-md-6" v-if="formData.discount_type === 'percentage'">
                                            <label class="form-label">{{ $t('maximum_discount') }}</label>
                                            <input type="number" class="form-control" v-model="formData.max_discount_amount" min="0" step="0.01" :placeholder="$t('enter_maximum_discount')" :disabled="isEditing && isPlatformCoupon && !isRemakenAdmin" />
                                        </div>
                                        <div class="col-md-6">
                                            <label class="form-label">{{ $t('minimum_purchase') }}</label>
                                            <input type="number" class="form-control" v-model="formData.minimum_purchase" min="0" step="0.01" :placeholder="$t('enter_minimum_purchase')" :disabled="isEditing && isPlatformCoupon && !isRemakenAdmin" />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <!-- Availability Section -->
                            <div class="form-section">
                                <div class="section-header">
                                    <div class="section-icon">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="18" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                                            <path stroke-linecap="round" stroke-linejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                                            <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
                                        </svg>
                                    </div>
                                    <h6 class="section-title">{{ $t('availability_information') || 'Availability' }}</h6>
                                </div>
                                <div class="section-body">
                                    <div class="row g-3">
                                        <div class="col-md-6" v-if="!isRemakenAdmin">
                                             <label class="form-label">{{ $t('available_at') }} <span class="required">*</span></label>
                                             <select class="form-select" v-model="formData.availability_type" :disabled="isEditing && isPlatformCoupon && !isRemakenAdmin">
                                                <option value="owner_all_branches">{{ $t('all_branches') }}</option>
                                                <option value="selected_branches">{{ $t('selected_branches') }}</option>
                                            </select>
                                        </div>
                                        <div class="col-md-6" v-else>
                                             <label class="form-label">{{ $t('available_at') }} <span class="required">*</span></label>
                                             <select class="form-select" v-model="formData.availability_type" :disabled="isEditing && isPlatformCoupon && !isRemakenAdmin">
                                                <option value="all_businesses">{{ $t('all_businesses') }}</option>
                                                <option value="selected_businesses">{{ $t('selected_businesses') }}</option>
                                                <option value="owner_all_branches">{{ $t('all_branches') }}</option>
                                                <option value="selected_branches">{{ $t('selected_branches') }}</option>
                                            </select>
                                        </div>
                                        <div class="col-12" v-if="formData.availability_type === 'selected_branches'">
                                            <label class="form-label">{{ $t('select_branches') }}</label>
                                            <div class="branch-selector">
                                                <div v-for="branch in branches" :key="branch.id" class="form-check">
                                                     <input class="form-check-input" type="checkbox" :id="'branch-' + branch.id" :value="branch.id" v-model="formData.branch_ids" :disabled="isEditing && isPlatformCoupon && !isRemakenAdmin" />
                                                    <label class="form-check-label" :for="'branch-' + branch.id">
                                                        {{ branch.name }} <span class="text-muted">({{ branch.code }})</span>
                                                    </label>
                                                </div>
                                            </div>
                                        </div>
                                        <div class="col-12" v-if="formData.availability_type === 'selected_businesses' && isRemakenAdmin">
                                            <label class="form-label">{{ $t('select_customers') }}</label>
                                            <div class="branch-selector">
                                                <div v-for="business in businesses" :key="business.id" class="form-check">
                                                     <input class="form-check-input" type="checkbox" :id="'business-' + business.id" :value="business.id" v-model="formData.business_ids" :disabled="isEditing && isPlatformCoupon && !isRemakenAdmin" />
                                                    <label class="form-check-label" :for="'business-' + business.id">
                                                        {{ business.business_name }}
                                                    </label>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <!-- Customer Eligibility Section -->
                            <div class="form-section">
                                <div class="section-header">
                                    <div class="section-icon">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="18" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                                            <path stroke-linecap="round" stroke-linejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-3.475-3.475 9.337 9.337 0 00-.952-4.121A9.37 9.37 0 0018.5 3.75a9.37 9.37 0 00-4.874.872M15 19.128v.003a9.37 9.37 0 01-4.874-.872 9.37 9.37 0 01-.952-4.121 4.125 4.125 0 00-3.475-3.475 9.337 9.337 0 00-.952-4.121A9.37 9.37 0 013.75 9a9.37 9.37 0 01.872-4.874m0 0A9.37 9.37 0 019 3.75a9.37 9.37 0 014.874.872m0 0A9.37 9.37 0 0118.5 9a9.37 9.37 0 01.872 4.874m0 0a9.37 9.37 0 00-.952 4.121 4.125 4.125 0 01-3.475 3.475 9.337 9.337 0 00-4.121.952m0 0a9.37 9.37 0 01-4.874.872m0 0A9.37 9.37 0 019 18.5a9.37 9.37 0 01-.952-4.121 4.125 4.125 0 00-3.475-3.475" />
                                        </svg>
                                    </div>
                                    <h6 class="section-title">{{ $t('eligibility') }}</h6>
                                </div>
                                <div class="section-body">
                                    <div class="row g-3">
                                        <div class="col-md-6">
                                            <label class="form-label">{{ $t('eligibility') }}</label>
                                             <select class="form-select" v-model="formData.eligibility_type" :disabled="formData.coupon_type === 'welcome' || (isEditing && isPlatformCoupon && !isRemakenAdmin)">
                                                <option v-for="opt in eligibilityOptions" :key="opt.value" :value="opt.value">{{ opt.label }}</option>
                                            </select>
                                            <small v-if="formData.coupon_type === 'welcome'" class="text-muted">{{ $t('welcome_coupon_note') }}</small>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <!-- Validity Section -->
                            <div class="form-section">
                                <div class="section-header">
                                    <div class="section-icon">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="18" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                                            <path stroke-linecap="round" stroke-linejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                                        </svg>
                                    </div>
                                    <h6 class="section-title">{{ $t('validity_information') || 'Validity' }}</h6>
                                </div>
                                <div class="section-body">
                                    <div class="row g-3">
                                        <div class="col-md-6">
                                            <label class="form-label">{{ $t('validity_type') }} <span class="required">*</span></label>
                                             <select class="form-select" v-model="formData.validity_type" :disabled="isEditing && isPlatformCoupon && !isRemakenAdmin">
                                                <option v-for="opt in validityTypeOptions" :key="opt.value" :value="opt.value">{{ opt.label }}</option>
                                            </select>
                                        </div>
                                        <div class="col-md-6" v-if="formData.validity_type === 'days_after_claim'">
                                            <label class="form-label">{{ $t('valid_for_days_after_claim', { days: formData.days_after_claim }) }}</label>
                                             <input type="number" class="form-control" v-model="formData.days_after_claim" min="1" :disabled="isEditing && isPlatformCoupon && !isRemakenAdmin" />
                                        </div>
                                        <template v-if="formData.validity_type === 'fixed_dates'">
                                            <div class="col-md-6">
                                                <label class="form-label">{{ $t('start_date') }}</label>
                                                 <input type="date" class="form-control" v-model="formData.start_date" :disabled="isEditing && isPlatformCoupon && !isRemakenAdmin" />
                                            </div>
                                            <div class="col-md-6">
                                                <label class="form-label">{{ $t('start_time') }}</label>
                                                 <input type="time" class="form-control" v-model="formData.start_time" :disabled="isEditing && isPlatformCoupon && !isRemakenAdmin" />
                                            </div>
                                            <div class="col-md-6">
                                                <label class="form-label">{{ $t('expiry_date') }}</label>
                                                 <input type="date" class="form-control" v-model="formData.expiry_date" :disabled="isEditing && isPlatformCoupon && !isRemakenAdmin" />
                                            </div>
                                            <div class="col-md-6">
                                                <label class="form-label">{{ $t('expiry_time') }}</label>
                                                 <input type="time" class="form-control" v-model="formData.expiry_time" :disabled="isEditing && isPlatformCoupon && !isRemakenAdmin" />
                                            </div>
                                        </template>
                                    </div>
                                </div>
                            </div>

                            <!-- Usage Limits Section -->
                            <div class="form-section">
                                <div class="section-header">
                                    <div class="section-icon">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="18" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                                            <path stroke-linecap="round" stroke-linejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v2.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125v-2.25zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v8.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125v-8.25zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
                                        </svg>
                                    </div>
                                    <h6 class="section-title">{{ $t('usage_information') || 'Usage Limits' }}</h6>
                                </div>
                                <div class="section-body">
                                    <div class="row g-3">
                                        <div class="col-md-6">
                                            <label class="form-label">{{ $t('total_usage_limit') }}</label>
                                             <select class="form-select" v-model="formData.usage_limit" :disabled="isEditing && isPlatformCoupon && !isRemakenAdmin">
                                                <option value="">{{ $t('unlimited') }}</option>
                                                <option value="100">100</option>
                                                <option value="500">500</option>
                                                <option value="1000">1000</option>
                                            </select>
                                        </div>
                                        <div class="col-md-6">
                                            <label class="form-label">{{ $t('uses_per_customer') }}</label>
                                             <input type="number" class="form-control" v-model="formData.uses_per_customer" min="1" :placeholder="$t('enter_uses_per_customer')" :disabled="formData.coupon_type === 'welcome' || (isEditing && isPlatformCoupon && !isRemakenAdmin)" />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div class="d-flex justify-content-end gap-2 mt-4">
                                <button type="button" class="btn btn-secondary btn-cancel" @click="router.push('/coupons')">{{ $t('cancel') }}</button>
                                <button type="submit" class="btn btn-primary btn-save" :disabled="loading || (isEditing && isPlatformCoupon && !isRemakenAdmin)">
                                    <span v-if="loading" class="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span>
                                    {{ loading ? $t('saving') : $t('save') }}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
.coupon-create-view {
    position: relative;
}

.coupon-loading-overlay {
    position: absolute;
    inset: 0;
    background: rgba(255, 255, 255, 0.85);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    z-index: 50;
    border-radius: 12px;
}

.page-title {
    color: #1A1A2E;
    font-weight: 700;
    font-size: 26px;
    margin: 0;
}

.btn-back {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 10px 22px;
    border-radius: 10px;
    font-weight: 600;
    font-size: 14px;
    border: 1.5px solid #E5E7EB;
    color: #6B7280;
    background: #fff;
    transition: all 0.2s ease;
}

.btn-back:hover {
    background: #F3F4F6;
    border-color: #D1D5DB;
    color: #374151;
}

.form-section {
    background: #fff;
    border-radius: 14px;
    border: 1px solid #E5E7EB;
    margin-bottom: 16px;
    overflow: hidden;
    transition: box-shadow 0.2s ease;
}

.form-section:hover {
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.section-header {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 14px 20px;
    background: #F8F9FB;
    border-bottom: 1px solid #E5E7EB;
}

.section-icon {
    width: 32px;
    height: 32px;
    border-radius: 8px;
    background: rgba(154, 119, 188, 0.1);
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
}

.section-icon svg {
    color: #9A77BC;
}

.section-title {
    margin: 0;
    font-weight: 700;
    font-size: 14px;
    color: #1A1A2E;
    text-transform: uppercase;
    letter-spacing: 0.3px;
}

.section-body {
    padding: 20px;
}

.form-label {
    display: block;
    font-weight: 600;
    font-size: 13px;
    color: #374151;
    margin-bottom: 6px;
}

.required {
    color: #E74C3C;
    font-weight: 700;
}

.form-control,
.form-select {
    border: 1.5px solid #E5E7EB;
    border-radius: 10px;
    padding: 10px 14px;
    font-size: 14px;
    background-color: #fff;
    color: #1A1A2E;
    min-height: 42px;
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.04);
    transition: all 0.2s ease;
    width: 100%;
}

.form-control:focus,
.form-select:focus {
    border-color: #9A77BC;
    box-shadow: 0 0 0 3px rgba(154, 119, 188, 0.15);
    outline: none;
}

.form-control::placeholder {
    color: #B0B7C3;
}

.branch-selector {
    max-height: 200px;
    overflow-y: auto;
    padding: 12px;
    background: #F8F9FB;
    border-radius: 10px;
    border: 1px solid #E5E7EB;
}

.form-check {
    margin-bottom: 8px;
}

.form-check-input {
    accent-color: #9A77BC;
}

.form-check-label {
    font-weight: 500;
    font-size: 14px;
    color: #374151;
}

.btn-cancel {
    padding: 10px 22px;
    border-radius: 10px;
    font-weight: 600;
    font-size: 14px;
    border: 1.5px solid #E5E7EB;
    color: #6B7280;
    background: #fff;
    transition: all 0.2s ease;
}

.btn-cancel:hover {
    background: #F3F4F6;
    border-color: #D1D5DB;
    color: #374151;
}

.btn-save {
    padding: 10px 28px;
    border-radius: 10px;
    font-weight: 600;
    font-size: 14px;
    background: #9A77BC;
    border: none;
    color: #fff;
    box-shadow: 0 2px 8px rgba(154, 119, 188, 0.3);
    transition: all 0.2s ease;
}

.btn-save:hover {
    background: #8A69AC;
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(154, 119, 188, 0.4);
    color: #fff;
}

.btn-save:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
}

@media (max-width: 768px) {
    .btn-back {
        width: 100%;
        justify-content: center;
    }
}
</style>
