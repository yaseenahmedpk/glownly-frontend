<script setup>
import { RouterLink } from 'vue-router';
import Vue3EasyDataTable from 'vue3-easy-data-table';
import 'vue3-easy-data-table/dist/style.css';
import { computed } from 'vue';
import { onBeforeRouteLeave } from "vue-router";
import { useI18n } from 'vue-i18n';

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
        notification_to: notification.notification_to,
    });
}
const deleteNotification = (notification) => {
    emit('deleteNotification', notification.id);
}

const headers = computed(() => {
    const cols = [
        { text: t('id'), value: 'id', sortable: true },
        { text: t('title'), value: 'title', sortable: true },
        { text: t('message'), value: 'message', sortable: true },
        { text: t('notification_to'), value: 'notification_to', sortable: true },
        { text: t('full_name'), value: 'user.full_name', sortable: true },
        { text: t('is_read'), value: 'is_read', sortable: true },
        { text: t('read_at'), value: 'read_at', sortable: true },
    ];
    return cols;
});
</script>
<template>
    <Vue3EasyDataTable :headers="headers" :items="notifications" :loading="loading"
        :search-field="['id', 'title', 'message', 'user.full_name']" :search-value="''" :sort-by="'id'" :sort-type="'asc'"
        :rows-per-page="10" :rows-per-page-message="'Rows per page:'" :rows-of-page-separator-message="'of'"
        :empty-message="'No data found'" :buttons-pagination="true" theme-color="#007bff"
        table-class-name="customize-vue-table table table-bordered">
        <template #item-is_read="item">
            <span>{{ item.read_at ? $t('yes') : $t('no') }}</span>
        </template>
        <template #item-read_at="item">
            <span>{{ item.read_at || '-' }}</span>
        </template>
    </Vue3EasyDataTable>
</template>