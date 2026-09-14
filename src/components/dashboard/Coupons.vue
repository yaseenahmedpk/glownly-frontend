<script setup>
import Vue3EasyDataTable from 'vue3-easy-data-table';
import 'vue3-easy-data-table/dist/style.css';
import { ref, computed, onMounted } from 'vue';
import { useRouter, onBeforeRouteLeave } from "vue-router";
import { useI18n } from 'vue-i18n';
import { Modal } from 'bootstrap';
import { hasPermission, hasAnyRole } from '../../helpers/authHelper';
import { useAuthStore } from '../../stores/authStore';
import { updateCouponStatus, deleteCoupon, regenerateCouponQrCode } from '../../services/couponService';
import { showErrorAlert } from '../../helpers/swal';
import { handleApiError } from '../../helpers/handleApiError';
import { useToast } from '../../helpers/useToast';
import Swal from 'sweetalert2';

const { t } = useI18n();
const { toast } = useToast();
const router = useRouter();
const authStore = useAuthStore();

onBeforeRouteLeave(() => {
    document.querySelectorAll(".tooltip").forEach(el => el.remove());
});

const props = defineProps({
    coupons: {
        type: Array,
        default: () => [],
    },
    loading: Boolean,
});

const emit = defineEmits(['refresh', 'qrCodeUpdated']);

const navigateToDetails = (id) => {
    router.push(`/coupons/${id}`);
};

const navigateToEdit = (id) => {
    router.push(`/coupons/${id}/edit`);
};

const confirmDelete = async (coupon) => {
    const result = await Swal.fire({
        title: t('are_you_sure'),
        text: t('delete_coupon_confirm'),
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: t('yes_delete'),
        cancelButtonText: t('cancel'),
    });

    if (result.isConfirmed) {
        try {
            await deleteCoupon(coupon.id);
            toast(t('coupon_deleted_successfully'));
            emit('refresh');
        } catch (error) {
            showErrorAlert(handleApiError(error, t));
        }
    }
};

const confirmStatusChange = async (coupon, newStatus) => {
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
            await updateCouponStatus(coupon.id, newStatus);
            toast(t(successKey));
            emit('refresh');
        } catch (error) {
            showErrorAlert(handleApiError(error, t));
        }
    }
};

const formatDiscount = (coupon) => {
    const discountType = coupon.discount_type;
    const discountValue = coupon.discount_value;
    const maxDiscount = coupon.max_discount_amount;

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

const formatAvailability = (coupon) => {
    const scope = coupon.availability_type;
    const branchCount = coupon.branch_ids?.length || 0;
    const businessCount = coupon.business_ids?.length || 0;

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

const formatValidity = (coupon) => {
    if (coupon.validity_type === 'fixed_dates') {
        const start = coupon.start_date ? new Date(coupon.start_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '';
        const expiry = coupon.expiry_date ? new Date(coupon.expiry_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '';
        if (start && expiry) {
            return `${start} → ${expiry}`;
        }
        return expiry || start || '-';
    } else if (coupon.validity_type === 'days_after_claim') {
        return `${coupon.days_after_claim || 0} ${t('days')} ${t('valid_for_days_after_claim', { days: coupon.days_after_claim || 0 })}`;
    }
    return '-';
};

const formatUsage = (coupon) => {
    if (coupon.usage_limit === null || coupon.usage_limit === undefined || coupon.usage_limit === 0) {
        return t('unlimited');
    }
    const used = coupon.used_count || 0;
    const total = coupon.usage_limit;
    return `${used} / ${total} ${t('used')}`;
};

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

const qrModal = ref(null);
const modalInstance = ref(null);
const modalTitle = ref('');
const qrCodeUrl = ref('');
const currentCouponId = ref(null);
const updateLoading = ref(false);

onMounted(() => {
    modalInstance.value = new Modal(qrModal.value);
});

const showQrCode = (couponId, couponTitle, qrcodeUrl) => {
    modalTitle.value = couponTitle;
    qrCodeUrl.value = qrcodeUrl;
    currentCouponId.value = couponId;
    modalInstance.value.show();
};

const printQrCode = () => {
    const printArea = document.getElementById('print-qrcode-content');
    if (printArea) {
        const style = document.createElement('style');
        style.textContent = `
            @media print {
                body * { visibility: hidden; }
                #print-qrcode-content, #print-qrcode-content * { visibility: visible; }
                #print-qrcode-content { position: absolute; left: 0; top: 0; width: 100%; }
            }
        `;
        document.head.appendChild(style);
        window.print();
        document.head.removeChild(style);
    }
};

const updateQrCodeHandler = async () => {
    updateLoading.value = true;
    try {
        const res = await regenerateCouponQrCode(currentCouponId.value);
        const baseUrl = res.data.qr_code_url || res.data.data?.qr_code_url;
        qrCodeUrl.value = baseUrl ? `${baseUrl}?t=${Date.now()}` : '';
        emit('qrCodeUpdated', currentCouponId.value, qrCodeUrl.value);
    } catch (err) {
        console.error('Failed to update QR code');
    } finally {
        updateLoading.value = false;
    }
};

const headers = computed(() => {
    return [
        { text: t('coupon'), value: 'title', sortable: true },
        { text: t('coupon_type'), value: 'coupon_type', sortable: true },
        { text: t('discount_type'), value: 'discount_type', sortable: true },
        { text: t('availability'), value: 'availability', sortable: false },
        { text: t('validity'), value: 'validity', sortable: false },
        { text: t('usage'), value: 'usage', sortable: false },
        { text: t('coupon_status'), value: 'status', sortable: true },
        { text: t('action'), value: 'action', sortable: false },
    ];
});
</script>

<template>
    <Vue3EasyDataTable
        :headers="headers"
        :items="coupons"
        :loading="loading"
        :search-field="['title', 'code']"
        :search-value="''"
        :sort-by="'created_at'"
        :sort-type="'desc'"
        :rows-per-page="10"
        :rows-per-page-message="'Rows per page:'"
        :rows-of-page-separator-message="'of'"
        :empty-message="t('no_coupons_found')"
        :buttons-pagination="true"
        theme-color="#9A77BC"
        table-class-name="customize-vue-table table table-bordered"
    >
        <template #item-title="item">
            <div>
                <div class="font-weight-bold" style="color: #1A1A2E;">{{ item.title }}</div>
                <div v-if="item.code" class="text-muted" style="font-size: 12px;">{{ item.code }}</div>
            </div>
        </template>

        <template #item-coupon_type="item">
            <span class="badge" style="background: rgba(154, 119, 188, 0.1); color: #9A77BC; border-radius: 6px; font-size: 12px; font-weight: 600;">
                {{ getCouponTypeLabel(item.coupon_type) }}
            </span>
        </template>

        <template #item-discount_type="item">
            <span v-html="formatDiscount(item)"></span>
        </template>

        <template #item-availability="item">
            {{ formatAvailability(item) }}
        </template>

        <template #item-validity="item">
            <span :class="{ 'text-muted': item.status !== 'expired' }">
                {{ formatValidity(item) }}
            </span>
        </template>

        <template #item-usage="item">
            {{ formatUsage(item) }}
        </template>

        <template #item-status="item">
            <span :class="['badge', getStatusClass(item.status)]" style="border-radius: 6px; font-size: 12px; font-weight: 600; padding: 6px 12px;">
                {{ t('status_' + item.status) }}
            </span>
        </template>

        <template #item-action="item">
            <div>
                <svg v-if="hasPermission('can_view_coupon')"
                    xmlns="http://www.w3.org/2000/svg" width="18" style="color:#007bff;cursor: pointer;"
                    @click="navigateToDetails(item.id)" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"
                    class="size-6" v-tooltip="{ text: t('view'), placement: 'left' }">
                    <path stroke-linecap="round" stroke-linejoin="round"
                        d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                    <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <svg v-if="hasPermission('can_edit_coupon') && canShowCouponActions(item)"
                    xmlns="http://www.w3.org/2000/svg" width="18" style="color:green;cursor: pointer;"
                    @click="navigateToEdit(item.id)" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"
                    class="size-6 ml-2" v-tooltip="{ text: t('edit'), placement: 'left' }">
                    <path stroke-linecap="round" stroke-linejoin="round"
                        d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
                </svg>

                <svg v-if="hasPermission('can_edit_coupon') && canShowCouponActions(item) && item.status === 'draft'"
                    xmlns="http://www.w3.org/2000/svg" width="18" style="color:#28a745;cursor: pointer;"
                    @click="confirmStatusChange(item, 'active')" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"
                    class="size-6 ml-2" v-tooltip="{ text: t('activate'), placement: 'top' }">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.347a1.125 1.125 0 0 1 0 1.972l-11.54 6.347a1.125 1.125 0 0 1-1.667-.986V5.653Z" />
                </svg>

                <svg v-if="hasPermission('can_edit_coupon') && canShowCouponActions(item) && item.status === 'active'"
                    xmlns="http://www.w3.org/2000/svg" width="18" style="color:#ffc107;cursor: pointer;"
                    @click="confirmStatusChange(item, 'paused')" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"
                    class="size-6 ml-2" v-tooltip="{ text: t('deactivate'), placement: 'top' }">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 5.25v13.5m-7.5-13.5v13.5" />
                </svg>

                <svg v-if="hasPermission('can_edit_coupon') && canShowCouponActions(item) && item.status === 'paused'"
                    xmlns="http://www.w3.org/2000/svg" width="18" style="color:#28a745;cursor: pointer;"
                    @click="confirmStatusChange(item, 'active')" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"
                    class="size-6 ml-2" v-tooltip="{ text: t('activate'), placement: 'top' }">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.347a1.125 1.125 0 0 1 0 1.972l-11.54 6.347a1.125 1.125 0 0 1-1.667-.986V5.653Z" />
                </svg>

                <svg v-if="hasPermission('can_delete_coupon') && canShowCouponActions(item)"
                    xmlns="http://www.w3.org/2000/svg" width="18" style="color:red;cursor: pointer;"
                    @click="confirmDelete(item)" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"
                    class="size-6 ml-2" v-tooltip="{ text: t('delete'), placement: 'top' }">
                    <path stroke-linecap="round" stroke-linejoin="round"
                        d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                </svg>

                <svg v-if="hasPermission('can_edit_coupon') && canShowCouponActions(item)"
                    xmlns="http://www.w3.org/2000/svg" width="18" style="color:#007bff;cursor: pointer;"
                    @click="showQrCode(item.id, item.title, item.qr_code_url)" fill="none" viewBox="0 0 24 24"
                    stroke-width="1.5" stroke="currentColor" class="size-6 ml-2"
                    v-tooltip="{ text: $t('show_qr_code'), placement: 'top' }">
                    <path stroke-linecap="round" stroke-linejoin="round"
                        d="M3.75 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 0 1 3.75 9.375v-4.5ZM3.75 14.625c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5a1.125 1.125 0 0 1-1.125-1.125v-4.5ZM13.5 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 0 1 13.5 9.375v-4.5Z" />
                    <path stroke-linecap="round" stroke-linejoin="round"
                        d="M6.75 6.75h.75v.75h-.75v-.75ZM6.75 16.5h.75v.75h-.75v-.75ZM16.5 6.75h.75v.75h-.75v-.75ZM13.5 13.5h.75v.75h-.75v-.75ZM13.5 19.5h.75v.75h-.75v-.75ZM19.5 13.5h.75v.75h-.75v-.75ZM19.5 19.5h.75v.75h-.75v-.75ZM16.5 16.5h.75v.75h-.75v-.75Z" />
                </svg>
            </div>
        </template>
    </Vue3EasyDataTable>

    <div class="modal fade" ref="qrModal" tabindex="-1">
        <div class="modal-dialog" style="max-width: 600px;">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title">{{ modalTitle }}</h5>
                    <button type="button" class="btn-close" @click="modalInstance.hide()">
                        <svg xmlns="http://www.w3.org/2000/svg" style="color:red;cursor: pointer;" width="18" fill="none" viewBox="0 0 24 24" stroke-width="1.5"
                            stroke="currentColor" class="size-6">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12" />
                        </svg>

                    </button>
                </div>
                <div class="modal-body">
                    <div id="print-qrcode-content" style="text-align: center;">
                        <h4 style="margin-bottom: 15px; font-size: 20px;">{{ modalTitle }}</h4>
                        <img :src="qrCodeUrl" alt="QR Code"
                            style="max-width: 100%; height: auto; border: 2px solid #000;" />
                    </div>
                </div>
                <div class="modal-footer">
                    <div class="d-flex gap-3">
                        <button type="button" class="btn btn-secondary" @click="modalInstance.hide()">{{ $t('close') }}</button>
                        <button type="button" class="btn btn-primary ml-2" @click="updateQrCodeHandler"
                            :disabled="updateLoading">
                            <span v-if="updateLoading" class="spinner-border spinner-border-sm" role="status"
                                aria-hidden="true"></span>
                            <span v-else>{{ $t('update_qr_code') }}</span>
                        </button>
                        <button type="button" class="btn btn-success ml-2" @click="printQrCode">{{ $t('print_qr_code') }}</button>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
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
