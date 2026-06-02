<script setup>
import { RouterLink } from 'vue-router';
import Vue3EasyDataTable from 'vue3-easy-data-table';
import 'vue3-easy-data-table/dist/style.css';
import { computed } from 'vue';
import { onBeforeRouteLeave } from "vue-router";
import { useI18n } from 'vue-i18n';
import { hasPermission } from '../../helpers/authHelper';

const { t } = useI18n();

defineProps({
    notifications: {
        type: Array,
        default: () => [],
    },
    loading: Boolean,
});
onBeforeRouteLeave(() => {
    document.querySelectorAll(".tooltip").forEach(el => el.remove());
});
const emit = defineEmits(['notificationData', 'deleteNotification'])

const selectNotification = (notification) => {
    emit('notificationData', {
        id: notification.id,
        title: notification.title,
        message: notification.message,
        is_active: notification.is_active ?? 0,
    });
}
const deleteNotification = (notification) => {
    emit('deleteNotification', notification.id);
}

const showIsActiveColumn = computed(() => hasPermission('can_create_notification'));

const headers = computed(() => {
    const cols = [
        { text: t('id'), value: 'id', sortable: true },
        { text: t('title'), value: 'title', sortable: true },
        { text: t('message'), value: 'message', sortable: true },
    ];

    if (showIsActiveColumn.value) {
        cols.push({ text: t('is_active'), value: 'is_active', sortable: true });
    }
    return cols;
});
</script>
<template>
    <Vue3EasyDataTable :headers="headers" :items="notifications" :loading="loading"
        :search-field="['id', 'title', 'message']" :search-value="''" :sort-by="'id'" :sort-type="'asc'"
        :rows-per-page="10" :rows-per-page-message="'Rows per page:'" :rows-of-page-separator-message="'of'"
        :empty-message="'No data found'" :buttons-pagination="true" theme-color="#007bff"
        table-class-name="customize-vue-table table table-bordered">
        <template #item-is_active="item">
            <span>{{ item.is_active == 1 ? $t('yes') : $t('no') }}</span>
        </template>

    </Vue3EasyDataTable>
</template>