<script setup>
import { ref, onMounted, computed, watch } from "vue";
import { useRouter } from "vue-router";
import Coupons from "../../components/dashboard/Coupons.vue";
import {
    getCoupons,
    deleteCoupon,
    updateCouponStatus,
} from "../../services/couponService";
import { handleApiError } from '../../helpers/handleApiError'
import { showErrorAlert } from '../../helpers/swal'
import { useToast } from '../../helpers/useToast'
import { useI18n } from 'vue-i18n'
import { hasPermission } from "../../helpers/authHelper";

const { t } = useI18n();
const { toast } = useToast();
const router = useRouter();
const loading = ref(false);
const coupons = ref([]);
const totalCoupons = ref(0);

const filters = ref({
    search: '',
    type: '',
    status: '',
    discount_type: '',
    availability_type: '',
    date_filter: '',
    start_date: '',
    end_date: '',
});

const isFilterOpen = ref(false);

const buildQueryParams = () => {
    const params = {};
    if (filters.value.search) params.search = filters.value.search;
    if (filters.value.type) params.type = filters.value.type;
    if (filters.value.status) params.status = filters.value.status;
    if (filters.value.discount_type) params.discount_type = filters.value.discount_type;
    if (filters.value.availability_type) params.availability_type = filters.value.availability_type;
    if (filters.value.date_filter) params.date_filter = filters.value.date_filter;
    if (filters.value.start_date) params.start_date = filters.value.start_date;
    if (filters.value.end_date) params.end_date = filters.value.end_date;
    return params;
};

const fetchCoupons = async () => {
    try {
        loading.value = true;
        const params = buildQueryParams();
        const response = await getCoupons(params);
        const raw = response.data;
        const data = Array.isArray(raw)
            ? raw
            : (raw.coupons || raw.data || []);
        coupons.value = Array.isArray(data) ? data : [];
        totalCoupons.value = response.data.total || coupons.value.length;
    } catch (error) {
        showErrorAlert(handleApiError(error, t));
    } finally {
        loading.value = false;
    }
};

const applyFilters = () => {
    fetchCoupons();
    isFilterOpen.value = false;
};

const clearFilters = () => {
    filters.value = {
        search: '',
        type: '',
        status: '',
        discount_type: '',
        availability_type: '',
        date_filter: '',
        start_date: '',
        end_date: '',
    };
    fetchCoupons();
};

const navigateToCreate = () => {
    router.push('/coupons/create');
};

const handleRefresh = () => {
    fetchCoupons();
};

const handleQrCodeUpdated = (couponId, newQrCodeUrl) => {
    coupons.value = coupons.value.map(coupon => 
        coupon.id === couponId 
            ? { ...coupon, qr_code_url: newQrCodeUrl }
            : coupon
    );
};

onMounted(() => {
    fetchCoupons();
});

const couponTypeOptions = [
    { value: '', label: t('all') || 'All' },
    { value: 'general', label: t('coupon_types.general') },
    { value: 'welcome', label: t('coupon_types.welcome') },
    { value: 'campaign', label: t('coupon_types.campaign') },
    { value: 'promotional', label: t('coupon_types.promotional') },
];

const statusOptions = [
    { value: '', label: t('all') || 'All' },
    { value: 'draft', label: t('status_draft') },
    { value: 'active', label: t('status_active') },
    { value: 'paused', label: t('status_paused') },
    { value: 'expired', label: t('status_expired') },
    { value: 'cancelled', label: t('status_cancelled') },
];

const discountTypeOptions = [
    { value: '', label: t('all') || 'All' },
    { value: 'percentage', label: t('discount_types.percentage') },
    { value: 'fixed_amount', label: t('discount_types.fixed_amount') },
];

const availabilityOptions = [
    { value: '', label: t('all') || 'All' },
    { value: 'owner_all_branches', label: t('all_branches') },
    { value: 'selected_branches', label: t('selected_branches') },
    { value: 'all_businesses', label: t('all_businesses') },
    { value: 'selected_businesses', label: t('selected_businesses') },
];

const dateFilterOptions = [
    { value: '', label: t('all') || 'All' },
    { value: 'currently_active', label: t('date_filter_currently_active') },
    { value: 'upcoming', label: t('date_filter_upcoming') },
    { value: 'expired', label: t('date_filter_expired') },
];
</script>

<template>
    <div class="coupons-view">
        <div class="row align-items-center mb-4">
            <div class="col-lg-6 col-md-6">
                <h3 class="page-title">{{ $t('coupons') }}</h3>
                <p class="text-muted mb-0" style="font-size: 14px;">{{ $t('manage_coupons') }}</p>
            </div>
            <div class="col-lg-6 col-md-6 d-flex justify-content-end" v-if="hasPermission('can_add_coupon')">
                <button class="btn btn-primary btn-add-coupon" @click="navigateToCreate">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" fill="none" viewBox="0 0 24 24" stroke-width="1.5"
                        stroke="currentColor" class="size-6">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                    </svg>
                    {{ $t('add_coupon') }}
                </button>
            </div>
        </div>

        <div class="row">
            <div class="col-lg-12">
                <div class="card border-0 shadow-sm" style="border-radius: 16px;">
                    <div class="card-header bg-white border-0 py-3" style="border-bottom: 1px solid #E5E7EB;">
                        <div class="d-flex justify-content-between align-items-center flex-wrap gap-2">
                            <div class="d-flex align-items-center gap-2">
                                <button class="btn btn-outline-secondary btn-filter-toggle" @click="isFilterOpen = !isFilterOpen">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3c4.97 0 9 4.03 9 9s-4.03 9-9 9-9-4.03-9-9 4.03-9 9-9Z" />
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 7v1m-6.364.636 1.414 1.414m12.728 0 1.414-1.414M12 17v1m-6.364-.636 1.414-1.414m12.728 0 1.414-1.414" />
                                    </svg>
                                    {{ $t('filter_by_status') }}
                                </button>
                                <span class="text-muted" style="font-size: 13px;">
                                    {{ totalCoupons }} {{ $t('coupons').toLowerCase() }}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div class="card-body">
                        <div v-if="isFilterOpen" class="filter-panel mb-4 p-4" style="background: #F8F9FB; border-radius: 12px; border: 1px solid #E5E7EB;">
                            <div class="row g-3">
                                <div class="col-md-3">
                                    <label class="form-label">{{ $t('search_coupons') }}</label>
                                    <input type="text" class="form-control" v-model="filters.search" :placeholder="$t('search_coupons')" />
                                </div>
                                <div class="col-md-3">
                                    <label class="form-label">{{ $t('coupon_type') }}</label>
                                    <select class="form-select" v-model="filters.type">
                                        <option v-for="opt in couponTypeOptions" :key="opt.value" :value="opt.value">{{ opt.label }}</option>
                                    </select>
                                </div>
                                <div class="col-md-3">
                                    <label class="form-label">{{ $t('coupon_status') }}</label>
                                    <select class="form-select" v-model="filters.status">
                                        <option v-for="opt in statusOptions" :key="opt.value" :value="opt.value">{{ opt.label }}</option>
                                    </select>
                                </div>
                                <div class="col-md-3">
                                    <label class="form-label">{{ $t('discount_type') }}</label>
                                    <select class="form-select" v-model="filters.discount_type">
                                        <option v-for="opt in discountTypeOptions" :key="opt.value" :value="opt.value">{{ opt.label }}</option>
                                    </select>
                                </div>
                                <div class="col-md-3">
                                    <label class="form-label">{{ $t('availability') }}</label>
                                    <select class="form-select" v-model="filters.availability_type">
                                        <option v-for="opt in availabilityOptions" :key="opt.value" :value="opt.value">{{ opt.label }}</option>
                                    </select>
                                </div>
                                <div class="col-md-3">
                                    <label class="form-label">{{ $t('filter_by_date') }}</label>
                                    <select class="form-select" v-model="filters.date_filter">
                                        <option v-for="opt in dateFilterOptions" :key="opt.value" :value="opt.value">{{ opt.label }}</option>
                                    </select>
                                </div>
                            </div>
                            <div class="d-flex gap-2 mt-3">
                                <button class="btn btn-primary btn-save-sm" @click="applyFilters">
                                    {{ $t('save') }}
                                </button>
                                <button class="btn btn-secondary btn-cancel-sm" @click="clearFilters">
                                    {{ $t('reset') }}
                                </button>
                            </div>
                        </div>

                        <div v-if="coupons.length === 0 && !loading" class="text-center py-5">
                            <svg xmlns="http://www.w3.org/2000/svg" width="64" fill="none" viewBox="0 0 24 24" stroke="#D1D5DB" stroke-width="1.5" class="mb-3">
                                <path stroke-linecap="round" stroke-linejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                            </svg>
                            <h5 class="text-muted mb-2">{{ $t('no_coupons_yet') }}</h5>
                            <p class="text-muted mb-3">{{ $t('create_first_coupon') }}</p>
                            <button class="btn btn-primary" @click="navigateToCreate" v-if="hasPermission('can_add_coupon')">
                                <svg xmlns="http://www.w3.org/2000/svg" width="18" fill="none" viewBox="0 0 24 24" stroke-width="1.5"
                                    stroke="currentColor" class="size-6">
                                    <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                                </svg>
                                {{ $t('add_coupon') }}
                            </button>
                        </div>

                        <Coupons
                            v-else
                            :coupons="coupons"
                            :loading="loading"
                            @refresh="handleRefresh"
                            @qrCodeUpdated="handleQrCodeUpdated"
                        />
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
.coupons-view {
    position: relative;
}

.page-title {
    color: #1A1A2E;
    font-weight: 700;
    font-size: 26px;
    margin: 0;
}

.btn-add-coupon {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 10px 22px;
    border-radius: 10px;
    font-weight: 600;
    font-size: 14px;
    background: #9A77BC;
    border: none;
    color: #fff;
    box-shadow: 0 2px 8px rgba(154, 119, 188, 0.3);
    transition: all 0.2s ease;
}

.btn-add-coupon:hover {
    background: #8A69AC;
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(154, 119, 188, 0.4);
    color: #fff;
}

.btn-filter-toggle {
    border-radius: 10px;
    font-weight: 600;
    font-size: 13px;
    padding: 8px 16px;
    border: 1.5px solid #E5E7EB;
    color: #374151;
    background: #fff;
    transition: all 0.2s ease;
}

.btn-filter-toggle:hover {
    background: #F3F4F6;
    border-color: #D1D5DB;
}

.filter-panel {
    transition: all 0.3s ease;
}

.btn-save-sm {
    padding: 8px 20px;
    border-radius: 10px;
    font-weight: 600;
    font-size: 13px;
    background: #9A77BC;
    border: none;
    color: #fff;
    transition: all 0.2s ease;
}

.btn-save-sm:hover {
    background: #8A69AC;
    color: #fff;
}

.btn-cancel-sm {
    padding: 8px 20px;
    border-radius: 10px;
    font-weight: 600;
    font-size: 13px;
    border: 1.5px solid #E5E7EB;
    color: #6B7280;
    background: #fff;
    transition: all 0.2s ease;
}

.btn-cancel-sm:hover {
    background: #F3F4F6;
    border-color: #D1D5DB;
    color: #374151;
}

@media (max-width: 768px) {
    .btn-add-coupon {
        width: 100%;
        justify-content: center;
    }
}
</style>
