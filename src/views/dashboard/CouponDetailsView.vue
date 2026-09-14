<script setup>
import { ref, onMounted } from "vue";
import { useRoute, useRouter, onBeforeRouteLeave } from "vue-router";
import { getCoupon, updateCouponStatus } from "../../services/couponService";
import { handleApiError } from '../../helpers/handleApiError'
import { showErrorAlert } from '../../helpers/swal'
import { useToast } from '../../helpers/useToast'
import { useI18n } from 'vue-i18n'
import { hasPermission, hasAnyRole } from "../../helpers/authHelper";
import { useAuthStore } from '../../stores/authStore';
import Swal from 'sweetalert2';

const { t } = useI18n();
const { toast } = useToast();
const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();
const loading = ref(false);

onBeforeRouteLeave(() => {
    document.querySelectorAll(".tooltip").forEach(el => el.remove());
});
const coupon = ref(null);

const getStatusClass = (status) => {
    switch (status) {
        case 'active': return 'badge-success';
        case 'draft': return 'badge-secondary';
        case 'paused': return 'badge-warning';
        case 'expired': return 'badge-danger';
        case 'cancelled': return 'badge-dark';
        default: return 'badge-secondary';
    }
};

const formatDiscount = (item) => {
    const discountType = item.discount_type;
    const discountValue = item.discount_value;
    const maxDiscount = item.max_discount_amount;

    if (discountType === 'percentage') {
        let text = `${discountValue}% ${t('off')}`;
        if (maxDiscount) {
            text += `<br><small class="text-muted">${t('up_to')} RM ${maxDiscount}</small>`;
        }
        return text;
    } else if (discountType === 'fixed_amount') {
        return `RM ${discountValue} ${t('off')}`;
    }
    return '-';
};

const formatValidity = (item) => {
    if (item.validity_type === 'fixed_dates') {
        const start = item.start_date ? new Date(item.start_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '';
        const expiry = item.expiry_date ? new Date(item.expiry_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '';
        if (start && expiry) {
            return `${start} → ${expiry}`;
        }
        return expiry || start || '-';
    } else if (item.validity_type === 'days_after_claim') {
        return `${item.days_after_claim || 0} ${t('days')}`;
    }
    return '-';
};

const formatAvailability = (item) => {
    const scope = item.availability_type;
    const branchCount = item.branch_ids?.length || 0;
    const businessCount = item.business_ids?.length || 0;

    if (scope === 'owner_all_branches') {
        return t('all_branches');
    } else if (scope === 'selected_branches') {
        return `${branchCount} ${t('selected_branches')}`;
    } else if (scope === 'all_businesses') {
        return t('all_businesses');
    } else if (scope === 'selected_businesses') {
        return `${businessCount} ${t('selected_businesses')}`;
    }
    return '-';
};

const getCouponTypeLabel = (type) => {
    const typeMap = {
        general: t('coupon_types.general'),
        welcome: t('coupon_types.welcome'),
        campaign: t('coupon_types.campaign'),
        promotional: t('coupon_types.promotional'),
    };
    return typeMap[type] || type;
};

const canShowCouponActions = (coupon) => {
    if (coupon.is_platform_coupon) {
        return authStore.user?.is_super_admin === true || hasAnyRole(['Super Admin', 'REMAKEN Admin']);
    }
    return true;
};

const fetchCoupon = async () => {
    try {
        loading.value = true;
        const response = await getCoupon(route.params.id);
        coupon.value = response.data;
    } catch (error) {
        showErrorAlert(handleApiError(error, t));
        router.push('/coupons');
    } finally {
        loading.value = false;
    }
};

const handleStatusChange = async (newStatus) => {
    let title = '';
    let text = '';
    let successKey = '';

    if (newStatus === 'active') {
        title = t('are_you_sure');
        text = t('resume_coupon_confirm');
        successKey = 'coupon_resumed_successfully';
    } else if (newStatus === 'paused') {
        title = t('are_you_sure');
        text = t('pause_coupon_confirm');
        successKey = 'coupon_paused_successfully';
    } else if (newStatus === 'cancelled') {
        title = t('are_you_sure');
        text = t('cancel_coupon_confirm');
        successKey = 'coupon_cancelled_successfully';
    }

    const result = await Swal.fire({
        title,
        text,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: t('yes'),
        cancelButtonText: t('cancel'),
    });

    if (result.isConfirmed) {
        try {
            await updateCouponStatus(coupon.value.id, newStatus);
            toast(t(successKey));
            fetchCoupon();
        } catch (error) {
            showErrorAlert(handleApiError(error, t));
        }
    }
};

onMounted(() => {
    fetchCoupon();
});
</script>

<template>
    <div class="coupon-details-view">
        <div class="row align-items-center mb-4">
            <div class="col-lg-6 col-md-6">
                <button class="btn btn-back btn-sm mb-2" @click="router.push('/coupons')">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" fill="none" viewBox="0 0 24 24" stroke-width="1.5"
                        stroke="currentColor" class="size-6">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
                    </svg>
                    {{ $t('back_to_coupons') }}
                </button>
                <h3 class="page-title">{{ coupon?.title || $t('coupon_details') }}</h3>
            </div>
            <div class="col-lg-6 col-md-6 d-flex justify-content-end gap-2" v-if="coupon">
                <button class="btn btn-primary btn-save" @click="handleStatusChange('active')" v-if="hasPermission('can_edit_coupon') && canShowCouponActions(coupon) && coupon.status === 'paused'">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.347a1.125 1.125 0 0 1 0 1.972l-11.54 6.347a1.125 1.125 0 0 1-1.667-.986V5.653Z" />
                    </svg>
                    {{ $t('activate') }}
                </button>
                <button class="btn btn-warning" @click="handleStatusChange('paused')" v-if="hasPermission('can_edit_coupon') && canShowCouponActions(coupon) && coupon.status === 'active'">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 5.25v13.5m-7.5-13.5v13.5" />
                    </svg>
                    {{ $t('deactivate') }}
                </button>
            </div>
        </div>

        <div v-if="loading" class="text-center py-5">
            <div class="spinner-border text-primary" role="status"></div>
        </div>

        <div v-else-if="coupon" class="row">
            <div class="col-lg-8 mx-auto">
                <!-- Coupon Header Card -->
                <div class="card border-0 shadow-sm mb-4" style="border-radius: 16px; border-left: 4px solid #9A77BC !important;">
                    <div class="card-body p-4">
                        <div class="d-flex align-items-start justify-content-between flex-wrap gap-3">
                            <div>
                                <div class="d-flex align-items-center gap-2 mb-2">
                                    <h4 class="mb-0 font-weight-bold" style="color: #1A1A2E;">{{ coupon.title }}</h4>
                                    <span :class="['badge', getStatusClass(coupon.status)]" style="border-radius: 6px; font-size: 12px; font-weight: 600; padding: 6px 12px;">
                                        {{ $t('status_' + (coupon.status || '-')) || '-' }}}
                                    </span>
                                    <span v-if="coupon.coupon_type === 'welcome'" class="badge" style="background: rgba(0, 180, 216, 0.1); color: #00B4D8; border-radius: 6px; font-size: 12px; font-weight: 600; padding: 6px 12px;">
                                        {{ $t('welcome_coupon') }}
                                    </span>
                                </div>
                                <p v-if="coupon.description" class="text-muted mb-0" style="font-size: 14px;">{{ coupon.description }}</p>
                                <div v-if="coupon.code" class="mt-2">
                                    <code class="px-3 py-1" style="background: #F8F9FB; border: 1px solid #E5E7EB; border-radius: 6px; font-size: 14px; font-weight: 600; color: #9A77BC;">{{ coupon.code }}</code>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Coupon Type & Eligibility Card -->
                <div class="card border-0 shadow-sm mb-4" style="border-radius: 12px; border: 1px solid #E5E7EB;">
                    <div class="card-header bg-white border-0 py-3" style="border-bottom: 1px solid #E5E7EB;">
                        <div class="d-flex align-items-center">
                            <div style="width: 32px; height: 32px; border-radius: 8px; background: rgba(154, 119, 188, 0.1); display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="#9A77BC" stroke-width="2">
                                    <path stroke-linecap="round" stroke-linejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-3.475-3.475 9.337 9.337 0 00-.952-4.121A9.37 9.37 0 0018.5 3.75a9.37 9.37 0 00-4.874.872M15 19.128v.003a9.37 9.37 0 01-4.874-.872 9.37 9.37 0 01-.952-4.121 4.125 4.125 0 00-3.475-3.475 9.337 9.337 0 00-4.121.952m0 0a9.37 9.37 0 014.874.872m0 0A9.37 9.37 0 0118.5 9a9.37 9.37 0 01.872 4.874m0 0a9.37 9.37 0 00-.952 4.121 4.125 4.125 0 01-3.475 3.475 9.337 9.337 0 00-4.121.952m0 0a9.37 9.37 0 01-4.874.872m0 0A9.37 9.37 0 019 18.5a9.37 9.37 0 01-.952-4.121 4.125 4.125 0 00-3.475-3.475" />
                                </svg>
                            </div>
                            <h6 class="mb-0 ml-2 font-weight-bold" style="color: #1A1A2E; font-size: 15px;">{{ $t('coupon_information') }}</h6>
                        </div>
                    </div>
                    <div class="card-body p-4">
                        <div class="row">
                            <div class="col-md-6 col-lg-4 mb-3">
                                <div class="text-muted mb-1" style="font-size: 12px; font-weight: 500;">{{ $t('coupon_type') }}</div>
                                <div class="font-weight-bold" style="font-size: 14px; color: #1A1A2E;">
                                    <span class="badge" style="background: rgba(154, 119, 188, 0.1); color: #9A77BC; border-radius: 6px; font-size: 12px; font-weight: 600;">
                                        {{ getCouponTypeLabel(coupon.coupon_type) }}
                                    </span>
                                </div>
                            </div>
                            <div class="col-md-6 col-lg-4 mb-3">
                                <div class="text-muted mb-1" style="font-size: 12px; font-weight: 500;">{{ $t('eligibility') }}</div>
                                <div class="font-weight-bold" style="font-size: 14px; color: #1A1A2E;">
                                    {{ $t('eligibility_types.' + (coupon.eligibility_type || '-')) || coupon.eligibility_type || '-' }}}
                                </div>
                            </div>
                            <div class="col-md-6 col-lg-4 mb-3">
                                <div class="text-muted mb-1" style="font-size: 12px; font-weight: 500;">{{ $t('coupon_status') }}</div>
                                <div class="font-weight-bold" style="font-size: 14px;">
                                    <span :class="['badge', getStatusClass(coupon.status)]" style="border-radius: 6px; font-size: 12px; font-weight: 600; padding: 6px 12px;">
                                        {{ $t('status_' + (coupon.status || '-')) || '-' }}}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Discount Card -->
                <div class="card border-0 shadow-sm mb-4" style="border-radius: 12px; border: 1px solid #E5E7EB;">
                    <div class="card-header bg-white border-0 py-3" style="border-bottom: 1px solid #E5E7EB;">
                        <div class="d-flex align-items-center">
                            <div style="width: 32px; height: 32px; border-radius: 8px; background: rgba(0, 180, 216, 0.1); display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="#00B4D8" stroke-width="2">
                                    <path stroke-linecap="round" stroke-linejoin="round" d="M2.25 18 9 11.25l4.306 4.306a11.95 11.95 0 0 1 5.814-5.519l2.74-1.22m0 0-5.94-2.281m5.94 2.28-2.28 5.941" />
                                </svg>
                            </div>
                            <h6 class="mb-0 ml-2 font-weight-bold" style="color: #1A1A2E; font-size: 15px;">{{ $t('discount_information') }}</h6>
                        </div>
                    </div>
                    <div class="card-body p-4">
                        <div class="row">
                            <div class="col-md-6 col-lg-4 mb-3">
                                <div class="text-muted mb-1" style="font-size: 12px; font-weight: 500;">{{ $t('discount_type') }}</div>
                                <div class="font-weight-bold" style="font-size: 14px; color: #1A1A2E;">{{ $t('discount_types.' + (coupon.discount_type || '-')) || coupon.discount_type || '-' }}}</div>
                            </div>
                            <div class="col-md-6 col-lg-4 mb-3">
                                <div class="text-muted mb-1" style="font-size: 12px; font-weight: 500;">{{ $t('discount_value') }}</div>
                                <div class="font-weight-bold" style="font-size: 14px; color: #1A1A2E;" v-html="formatDiscount(coupon)"></div>
                            </div>
                            <div class="col-md-6 col-lg-4 mb-3" v-if="coupon.minimum_purchase">
                                <div class="text-muted mb-1" style="font-size: 12px; font-weight: 500;">{{ $t('minimum_purchase') }}</div>
                                <div class="font-weight-bold" style="font-size: 14px; color: #1A1A2E;">RM {{ coupon.minimum_purchase }}</div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Availability & Validity Card -->
                <div class="card border-0 shadow-sm mb-4" style="border-radius: 12px; border: 1px solid #E5E7EB;">
                    <div class="card-header bg-white border-0 py-3" style="border-bottom: 1px solid #E5E7EB;">
                        <div class="d-flex align-items-center">
                            <div style="width: 32px; height: 32px; border-radius: 8px; background: rgba(46, 204, 113, 0.1); display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="#2ECC71" stroke-width="2">
                                    <path stroke-linecap="round" stroke-linejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
                                </svg>
                            </div>
                            <h6 class="mb-0 ml-2 font-weight-bold" style="color: #1A1A2E; font-size: 15px;">{{ $t('validity_information') }}</h6>
                        </div>
                    </div>
                    <div class="card-body p-4">
                        <div class="row">
                            <div class="col-md-6 col-lg-4 mb-3">
                                <div class="text-muted mb-1" style="font-size: 12px; font-weight: 500;">{{ $t('validity_type') }}</div>
                                <div class="font-weight-bold" style="font-size: 14px; color: #1A1A2E;">{{ $t('validity_types.' + (coupon.validity_type || '-')) || coupon.validity_type || '-' }}}</div>
                            </div>
                            <div class="col-md-6 col-lg-4 mb-3">
                                <div class="text-muted mb-1" style="font-size: 12px; font-weight: 500;">{{ $t('validity') }}</div>
                                <div class="font-weight-bold" style="font-size: 14px; color: #1A1A2E;">{{ formatValidity(coupon) }}</div>
                            </div>
                            <div class="col-md-6 col-lg-4 mb-3">
                                <div class="text-muted mb-1" style="font-size: 12px; font-weight: 500;">{{ $t('availability') }}</div>
                                <div class="font-weight-bold" style="font-size: 14px; color: #1A1A2E;">{{ formatAvailability(coupon) }}</div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Usage Limits Card -->
                <div class="card border-0 shadow-sm mb-4" style="border-radius: 12px; border: 1px solid #E5E7EB;">
                    <div class="card-header bg-white border-0 py-3" style="border-bottom: 1px solid #E5E7EB;">
                        <div class="d-flex align-items-center">
                            <div style="width: 32px; height: 32px; border-radius: 8px; background: rgba(255, 193, 7, 0.1); display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="#FFC107" stroke-width="2">
                                    <path stroke-linecap="round" stroke-linejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v2.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125v-2.25zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v8.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125v-8.25zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
                                </svg>
                            </div>
                            <h6 class="mb-0 ml-2 font-weight-bold" style="color: #1A1A2E; font-size: 15px;">{{ $t('usage_information') }}</h6>
                        </div>
                    </div>
                    <div class="card-body p-4">
                        <div class="row">
                            <div class="col-md-6 col-lg-4 mb-3">
                                <div class="text-muted mb-1" style="font-size: 12px; font-weight: 500;">{{ $t('total_usage_limit') }}</div>
                                <div class="font-weight-bold" style="font-size: 14px; color: #1A1A2E;">
                                    {{ coupon.usage_limit ? `${coupon.usage_limit}` : t('unlimited') }}
                                </div>
                            </div>
                            <div class="col-md-6 col-lg-4 mb-3">
                                <div class="text-muted mb-1" style="font-size: 12px; font-weight: 500;">{{ $t('usage') }}</div>
                                <div class="font-weight-bold" style="font-size: 14px; color: #1A1A2E;">
                                    {{ coupon.used_count || 0 }} / {{ coupon.usage_limit || t('unlimited') }}
                                </div>
                            </div>
                            <div class="col-md-6 col-lg-4 mb-3">
                                <div class="text-muted mb-1" style="font-size: 12px; font-weight: 500;">{{ $t('uses_per_customer') }}</div>
                                <div class="font-weight-bold" style="font-size: 14px; color: #1A1A2E;">{{ coupon.usage_limit_per_customer || coupon.uses_per_customer || 1 }}</div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Meta Information -->
                <div class="card border-0 shadow-sm" style="border-radius: 12px; border: 1px solid #E5E7EB;">
                    <div class="card-header bg-white border-0 py-3" style="border-bottom: 1px solid #E5E7EB;">
                        <div class="d-flex align-items-center">
                            <div style="width: 32px; height: 32px; border-radius: 8px; background: rgba(107, 114, 128, 0.1); display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="#6B7280" stroke-width="2">
                                    <path stroke-linecap="round" stroke-linejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                                </svg>
                            </div>
                            <h6 class="mb-0 ml-2 font-weight-bold" style="color: #1A1A2E; font-size: 15px;">{{ $t('coupon_information') }}</h6>
                        </div>
                    </div>
                    <div class="card-body p-4">
                        <div class="row">
                            <div class="col-md-6 col-lg-4 mb-3">
                                <div class="text-muted mb-1" style="font-size: 12px; font-weight: 500;">{{ $t('created_at') }}</div>
                                <div class="font-weight-bold" style="font-size: 14px; color: #1A1A2E;">{{ coupon.created_at ? new Date(coupon.created_at).toLocaleString() : '-' }}</div>
                            </div>
                            <div class="col-md-6 col-lg-4 mb-3">
                                <div class="text-muted mb-1" style="font-size: 12px; font-weight: 500;">{{ $t('updated_at') }}</div>
                                <div class="font-weight-bold" style="font-size: 14px; color: #1A1A2E;">{{ coupon.updated_at ? new Date(coupon.updated_at).toLocaleString() : '-' }}</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <div v-else-if="!loading" class="text-center py-5">
            <p class="text-muted">{{ t('no_coupons_found') }}</p>
        </div>
    </div>
</template>

<style scoped>
.coupon-details-view {
    position: relative;
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

.badge-success {
    background: rgba(46, 204, 113, 0.1);
    color: #2ECC71;
}
.badge-warning {
    background: rgba(255, 193, 7, 0.1);
    color: #FFC107;
}
.badge-danger {
    background: rgba(231, 76, 60, 0.1);
    color: #E74C3C;
}
.badge-secondary {
    background: rgba(107, 114, 128, 0.1);
    color: #6B7280;
}
.badge-dark {
    background: rgba(0, 0, 0, 0.1);
    color: #1A1A2E;
}
</style>
