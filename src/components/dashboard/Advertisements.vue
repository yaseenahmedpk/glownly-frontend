<script setup>
import Vue3EasyDataTable from 'vue3-easy-data-table';
import 'vue3-easy-data-table/dist/style.css';
import { computed } from 'vue';
import { onBeforeRouteLeave } from "vue-router";
import { useI18n } from 'vue-i18n';
import { hasPermission } from '../../helpers/authHelper';
import { updateAdvertisementStatus } from '../../services/advertisementService';
import { showErrorAlert } from '../../helpers/swal';
import { handleApiError } from '../../helpers/handleApiError';
import { useToast } from '../../helpers/useToast';
import Swal from 'sweetalert2';

const { t } = useI18n();
const { toast } = useToast();

defineProps({
    advertisements: {
        type: Array,
        default: () => [],
    },
    loading: Boolean,
});
onBeforeRouteLeave(() => {
    document.querySelectorAll(".tooltip").forEach(el => el.remove());
});
const emit = defineEmits(['advertisementData', 'deleteAdvertisement', 'statusUpdated'])

const selectAdvertisement = (advertisement) => {
    const placements = (advertisement.placements || [])
        .map(p => p.placement)
        .filter(Boolean);
    emit('advertisementData', {
        id: advertisement.id,
        title: advertisement.title,
        type: advertisement.type,
        source_type: advertisement.source_type,
        advertiser_name: advertisement.advertiser_name || '',
        click_url: advertisement.click_url || '',
        deep_link: advertisement.deep_link || '',
        thumbnail_url: advertisement.thumbnail_url || '',
        media_url: advertisement.media_url || '',
        starts_at: advertisement.starts_at,
        ends_at: advertisement.ends_at,
        priority: advertisement.priority,
        display_duration_seconds: advertisement.display_duration_seconds,
        skip_allowed: advertisement.skip_allowed,
        skip_after_seconds: advertisement.skip_after_seconds,
        click_count: advertisement.click_count,
        click_limit: advertisement.click_limit,
        impression_count: advertisement.impression_count,
        impression_limit: advertisement.impression_limit,
        is_active: advertisement.is_active,
        placements,
        placement: placements[0] || 'home_banner',
    });
}
const deleteAdvertisementItem = (advertisement) => {
    emit('deleteAdvertisement', advertisement.id);
}
const toggleStatus = async (advertisement) => {
    const newStatus = advertisement.is_active == 1 ? 0 : 1;
    const actionText = newStatus ? 'activate' : 'deactivate';

    const result = await Swal.fire({
        title: t('are_you_sure'),
        text: `${actionText === 'activate' ? 'Activate' : 'Deactivate'} "${advertisement.title}"?`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: t('yes'),
        cancelButtonText: t('cancel')
    });

    if (result.isConfirmed) {
        try {
            await updateAdvertisementStatus(advertisement.id, newStatus);
            emit('statusUpdated', advertisement.id);
            toast(t(newStatus ? 'advertisement_activated_successfully' : 'advertisement_deactivated_successfully'));
        } catch (error) {
            showErrorAlert(handleApiError(error, t));
        }
    }
}

const headers = computed(() => {
    return [
        { text: t('id'), value: 'id', sortable: true },
        { text: t('title'), value: 'title', sortable: true },
        { text: t('type'), value: 'type', sortable: true },
        { text: t('advertiser_name'), value: 'advertiser_name', sortable: true },
        { text: t('placement'), value: 'placements', sortable: true },
        { text: t('priority'), value: 'priority', sortable: true },
        { text: t('clicks'), value: 'click_count', sortable: true },
        { text: t('impressions'), value: 'impression_count', sortable: true },
        { text: t('status'), value: 'is_active', sortable: true },
        { text: t('action'), value: 'action', sortable: false },
    ];
});
</script>

<template>
    <Vue3EasyDataTable :headers="headers" :items="advertisements" :loading="loading" :search-field="['id', 'title', 'type', 'advertiser_name', 'placements']"
        :search-value="''" :sort-by="'id'" :sort-type="'asc'" :rows-per-page="10"
        :rows-per-page-message="'Rows per page:'" :rows-of-page-separator-message="'of'"
        :empty-message="'No data found'" :buttons-pagination="true" theme-color="#007bff"
        table-class-name="customize-vue-table table table-bordered">
        <template #item-placements="item">
            <span v-if="item.placements && item.placements.length">
                <span v-for="p in item.placements" :key="p.id" class="badge" style="background: rgba(154, 119, 188, 0.1); color: #9A77BC; border-radius: 6px; font-size: 12px; font-weight: 600; margin-right: 4px;">
                    {{ p.placement }}
                </span>
            </span>
            <span v-else>-</span>
        </template>
        <template #item-click_count="item">
            <span>{{ item.click_count || 0 }} / {{ item.click_limit || '-' }}</span>
        </template>
        <template #item-impression_count="item">
            <span>{{ item.impression_count || 0 }} / {{ item.impression_limit || '-' }}</span>
        </template>
        <template #item-is_active="item">
            <span :class="item.is_active == 1 ? 'text-success' : 'text-danger'">
                {{ item.is_active == 1 ? t('active') : t('inactive') }}
            </span>
        </template>
        <template #item-type="item">
            <span class="badge" style="background: rgba(154, 119, 188, 0.1); color: #9A77BC; border-radius: 6px; font-size: 12px; font-weight: 600;">
                {{ item.type }}
            </span>
        </template>
        <template #item-priority="item">
            <span class="badge" style="background: rgba(0, 180, 216, 0.1); color: #00B4D8; border-radius: 6px; font-size: 12px; font-weight: 600;">
                {{ item.priority }}
            </span>
        </template>
        <template #item-action="item">
            <div>
                <svg v-if="hasPermission('can_edit_advertisement')"
                    xmlns="http://www.w3.org/2000/svg" width="18" style="color:green;cursor: pointer;"
                    @click="selectAdvertisement(item)" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"
                    class="size-6" v-tooltip="{ text: $t('edit'), placement: 'left' }">
                    <path stroke-linecap="round" stroke-linejoin="round"
                        d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
                </svg>
                <svg v-if="hasPermission('can_delete_advertisement')"
                    xmlns="http://www.w3.org/2000/svg" width="18" style="color:red;cursor: pointer;"
                    @click="deleteAdvertisementItem(item)" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"
                    class="size-6 ml-2" v-tooltip="{ text: $t('delete'), placement: 'top' }">
                    <path stroke-linecap="round" stroke-linejoin="round"
                        d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                </svg>
                <svg v-if="hasPermission('can_edit_advertisement')"
                    xmlns="http://www.w3.org/2000/svg" width="18" :style="{ color: item.is_active == 1 ? 'orange' : 'blue', cursor: 'pointer' }"
                    @click="toggleStatus(item)" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"
                    class="size-6 ml-2" v-tooltip="{ text: item.is_active == 1 ? t('deactivate') : t('activate'), placement: 'top' }">
                    <path stroke-linecap="round" stroke-linejoin="round"
                        d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182" />
                </svg>
            </div>
        </template>
    </Vue3EasyDataTable>
</template>
